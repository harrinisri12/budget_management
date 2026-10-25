/**
 * College Budget Management System - Excel Export Utility
 * Generates valid Microsoft Excel spreadsheet (.xlsx / SpreadsheetML format)
 * with the exact required nine proposal and settlement columns.
 */

// Helper to escape XML special characters
const escapeXml = (unsafe) => {
  if (unsafe === null || unsafe === undefined) return '';
  return String(unsafe)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
};

/**
 * Extracts valid Google Drive or uploaded file link from a proposal record.
 * Returns 'Not Uploaded' if no valid file link exists.
 */
export const getProposalFileLink = (p) => {
  if (!p) return 'Not Uploaded';

  const doc = p.eventDetails?.documentDetails || p.event_details?.documentDetails;
  const evt = p.eventDetails || p.event_details;

  const candidate =
    doc?.driveUrl ||
    doc?.googleDriveLink ||
    doc?.fileUrl ||
    evt?.driveUrl ||
    evt?.googleDriveLink ||
    evt?.fileUrl ||
    p.driveUrl ||
    p.fileUrl ||
    p.fileLink;

  if (candidate && typeof candidate === 'string') {
    const trimmed = candidate.trim();
    if (
      trimmed.startsWith('http://') ||
      trimmed.startsWith('https://') ||
      trimmed.includes('drive.google.com')
    ) {
      return trimmed;
    }
  }

  return 'Not Uploaded';
};

/**
 * Required Nine Excel Columns in exact order:
 * 1. Reference Number
 * 2. Category
 * 3. Subcategory
 * 4. Faculty Name
 * 5. Event Name
 * 6. Proposed Amount
 * 7. Settlement Amount
 * 8. Proposal Status
 * 9. Settlement Status
 */
export const REQUIRED_EXCEL_COLUMNS = [
  'Reference Number',
  'Category',
  'Subcategory',
  'Faculty Name',
  'Event Name',
  'Proposed Amount',
  'Settlement Amount',
  'Proposal Status',
  'Settlement Status'
];

/**
 * Resolves the faculty member's actual full name with robust fallbacks:
 * 1. p.facultyName (if not generic placeholder)
 * 2. coordinator name from event_details (p.eventDetails.programmeDetails.coordinator.name)
 * 3. profiles relationship (p.profiles.name)
 * 4. facultyList lookup by id or email
 */
export const resolveFacultyName = (p, facultyList = []) => {
  if (!p) return 'Faculty Member';

  // 1. Check p.facultyName if not generic
  if (p.facultyName && p.facultyName !== 'Faculty Member' && p.facultyName !== 'Unknown Faculty') {
    return p.facultyName;
  }

  // 2. Check coordinator details in event_details
  const progDetails = p.eventDetails?.programmeDetails || p.event_details?.programmeDetails;
  const coordinatorName = progDetails?.coordinator?.name;
  if (coordinatorName && typeof coordinatorName === 'string' && coordinatorName.trim()) {
    return coordinatorName.trim();
  }

  // 3. Check profiles object
  if (p.profiles?.name && typeof p.profiles.name === 'string' && p.profiles.name.trim()) {
    return p.profiles.name.trim();
  }

  // 4. Lookup in facultyList array if provided
  if (Array.isArray(facultyList) && facultyList.length > 0) {
    const fId = p.facultyId || p.faculty_id;
    const fEmail = (p.facultyEmail || p.faculty_email || '').toLowerCase().trim();

    const matched = facultyList.find((f) => {
      if (fId && (f.id === fId || f.dbId === fId)) return true;
      if (fEmail && f.email && f.email.toLowerCase().trim() === fEmail) return true;
      return false;
    });

    if (matched?.name) return matched.name;
  }

  return p.facultyName || 'Faculty Member';
};

/**
 * Exports proposals to Microsoft Excel (.xlsx) with the exact 9 columns in required order.
 * 
 * @param {Array} proposals - Array of proposal records
 * @param {string} academicYearLabel - Academic year label (e.g. '2026-2027')
 * @param {Object} options - Configuration options (facultyList, filename, customTitle)
 * @returns {Object} result - { success, filename, count }
 */
export const exportProposalsToExcel = (proposals = [], academicYearLabel = 'Current', options = {}) => {
  const {
    facultyList = [],
    filename: customFilename = null
  } = options;

  const today = new Date().toISOString().split('T')[0];
  const cleanYear = String(academicYearLabel).replace(/[^a-zA-Z0-9_-]/g, '_');
  const filename = customFilename || `College_Budget_Management_Report_${cleanYear}_${today}.xlsx`;

  let rowsXml = '';
  let totalProposed = 0;
  let totalSettled = 0;
  let settledCount = 0;

  // 1. Build Header Row
  rowsXml += '   <Row ss:Height="26">\n';
  REQUIRED_EXCEL_COLUMNS.forEach((colName) => {
    rowsXml += `    <Cell ss:StyleID="HeaderStyle"><Data ss:Type="String">${escapeXml(colName)}</Data></Cell>\n`;
  });
  rowsXml += '   </Row>\n';

  // 2. Build Data Rows
  if (proposals.length === 0) {
    // Empty state row
    rowsXml += '   <Row ss:Height="24">\n';
    rowsXml += `    <Cell ss:MergeAcross="8" ss:StyleID="EmptyNoticeStyle"><Data ss:Type="String">No proposal records found matching the specified filters.</Data></Cell>\n`;
    rowsXml += '   </Row>\n';
  } else {
    proposals.forEach((p) => {
      // 1. Reference Number
      const refNumber = p.proposalNumber || p.proposal_number || p.proposalId || p.id || '—';

      // 2. Category
      const category = p.category || p.budget_categories?.name || p.eventDetails?.categoryName || 'General';

      // 3. Subcategory
      const subcategory = p.subCategory || p.sub_category || p.eventDetails?.subCategoryName || p.eventDetails?.schemaType || '—';

      // 4. Faculty Name
      const facultyName = resolveFacultyName(p, facultyList);

      // 5. Event Name
      const eventName = p.title || p.eventDetails?.programmeDetails?.title || '—';

      // 6. Proposed Amount (Numeric currency)
      const proposedAmount = Number(p.amount ?? p.eventDetails?.totalProposedAmount ?? 0) || 0;
      totalProposed += proposedAmount;

      // 7. Settlement Amount (Numeric currency if settled/recorded, blank if not reached settlement)
      const normSettlementStatus = String(p.settlementStatus || p.settlement_status || '').toLowerCase().trim();
      const isSettled = normSettlementStatus === 'settled';

      let settlementAmountVal = null;
      if (p.settlementAmount !== null && p.settlementAmount !== undefined && p.settlementAmount !== '') {
        const parsed = Number(p.settlementAmount);
        if (!isNaN(parsed)) {
          settlementAmountVal = parsed;
        }
      } else if (p.settlement_amount !== null && p.settlement_amount !== undefined && p.settlement_amount !== '') {
        const parsed = Number(p.settlement_amount);
        if (!isNaN(parsed)) {
          settlementAmountVal = parsed;
        }
      }

      if (isSettled && settlementAmountVal !== null) {
        totalSettled += settlementAmountVal;
        settledCount += 1;
      }

      // 8. Proposal Status
      const rawStatus = p.status || 'Pending';
      const proposalStatus = rawStatus.charAt(0).toUpperCase() + rawStatus.slice(1);

      // 9. Settlement Status
      let settlementStatus = 'Unsettled';
      if (normSettlementStatus === 'settled') {
        settlementStatus = 'Settled';
      } else if (normSettlementStatus === 'pending_settlement' || normSettlementStatus === 'pending') {
        settlementStatus = 'Pending Settlement';
      } else if (normSettlementStatus === 'under_review') {
        settlementStatus = 'Under Review';
      }

      // Generate Table Row
      rowsXml += '   <Row ss:Height="22">\n';
      // 1. Reference Number
      rowsXml += `    <Cell ss:StyleID="TextStyle"><Data ss:Type="String">${escapeXml(refNumber)}</Data></Cell>\n`;
      // 2. Category
      rowsXml += `    <Cell ss:StyleID="TextStyle"><Data ss:Type="String">${escapeXml(category)}</Data></Cell>\n`;
      // 3. Subcategory
      rowsXml += `    <Cell ss:StyleID="TextStyle"><Data ss:Type="String">${escapeXml(subcategory)}</Data></Cell>\n`;
      // 4. Faculty Name
      rowsXml += `    <Cell ss:StyleID="TextStyle"><Data ss:Type="String">${escapeXml(facultyName)}</Data></Cell>\n`;
      // 5. Event Name
      rowsXml += `    <Cell ss:StyleID="TextStyle"><Data ss:Type="String">${escapeXml(eventName)}</Data></Cell>\n`;
      // 6. Proposed Amount (Numeric)
      rowsXml += `    <Cell ss:StyleID="CurrencyStyle"><Data ss:Type="Number">${proposedAmount}</Data></Cell>\n`;
      // 7. Settlement Amount (Numeric if recorded, blank if not reached settlement)
      if (settlementAmountVal !== null) {
        rowsXml += `    <Cell ss:StyleID="CurrencyStyle"><Data ss:Type="Number">${settlementAmountVal}</Data></Cell>\n`;
      } else {
        rowsXml += `    <Cell ss:StyleID="BlankStyle"><Data ss:Type="String"></Data></Cell>\n`;
      }
      // 8. Proposal Status
      rowsXml += `    <Cell ss:StyleID="CenterStyle"><Data ss:Type="String">${escapeXml(proposalStatus)}</Data></Cell>\n`;
      // 9. Settlement Status
      rowsXml += `    <Cell ss:StyleID="CenterStyle"><Data ss:Type="String">${escapeXml(settlementStatus)}</Data></Cell>\n`;
      rowsXml += '   </Row>\n';
    });

    // 3. Build Totals Row
    rowsXml += '   <Row ss:Height="25">\n';
    rowsXml += `    <Cell ss:MergeAcross="4" ss:StyleID="TotalLabelStyle"><Data ss:Type="String">Total (${proposals.length} Proposals)</Data></Cell>\n`;
    rowsXml += `    <Cell ss:StyleID="TotalCurrencyStyle"><Data ss:Type="Number">${totalProposed}</Data></Cell>\n`;
    if (settledCount > 0) {
      rowsXml += `    <Cell ss:StyleID="TotalCurrencyStyle"><Data ss:Type="Number">${totalSettled}</Data></Cell>\n`;
    } else {
      rowsXml += `    <Cell ss:StyleID="TotalBlankStyle"><Data ss:Type="String"></Data></Cell>\n`;
    }
    rowsXml += `    <Cell ss:StyleID="TotalLabelStyle"><Data ss:Type="String"></Data></Cell>\n`;
    rowsXml += `    <Cell ss:StyleID="TotalLabelStyle"><Data ss:Type="String"></Data></Cell>\n`;
    rowsXml += '   </Row>\n';
  }

  // XML Workbook Document
  const xmlContent = `<?xml version="1.0" encoding="UTF-8"?>
<?mso-application progid="Excel.Sheet"?>
<Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet"
 xmlns:o="urn:schemas-microsoft-com:office:office"
 xmlns:x="urn:schemas-microsoft-com:office:excel"
 xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet"
 xmlns:html="http://www.w3.org/TR/REC-html40">
 <DocumentProperties xmlns="urn:schemas-microsoft-com:office:office">
  <Title>College Budget Management Report - Proposals Register</Title>
  <Subject>Proposals and Settlements Audit Register</Subject>
  <Author>Kongu Engineering College</Author>
  <Company>Department of Computer Science and Engineering</Company>
  <Created>${new Date().toISOString()}</Created>
 </DocumentProperties>
 <Styles>
  <Style ss:ID="Default" ss:Name="Normal">
   <Alignment ss:Vertical="Center"/>
   <Borders/>
   <Font ss:FontName="Segoe UI" ss:Size="10" ss:Color="#1E293B"/>
   <Interior/>
   <NumberFormat/>
   <Protection/>
  </Style>
  <Style ss:ID="HeaderStyle">
   <Alignment ss:Horizontal="Center" ss:Vertical="Center" ss:WrapText="1"/>
   <Borders>
    <Border ss:Position="Bottom" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#475569"/>
    <Border ss:Position="Top" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#475569"/>
    <Border ss:Position="Left" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#475569"/>
    <Border ss:Position="Right" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#475569"/>
   </Borders>
   <Font ss:FontName="Segoe UI" ss:Size="10.5" ss:Color="#FFFFFF" ss:Bold="1"/>
   <Interior ss:Color="#0F172A" ss:Pattern="Solid"/>
  </Style>
  <Style ss:ID="TextStyle">
   <Alignment ss:Vertical="Center"/>
   <Borders>
    <Border ss:Position="Bottom" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#E2E8F0"/>
    <Border ss:Position="Left" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#E2E8F0"/>
    <Border ss:Position="Right" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#E2E8F0"/>
    <Border ss:Position="Top" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#E2E8F0"/>
   </Borders>
   <Font ss:FontName="Segoe UI" ss:Size="10" ss:Color="#0F172A"/>
  </Style>
  <Style ss:ID="CenterStyle">
   <Alignment ss:Horizontal="Center" ss:Vertical="Center"/>
   <Borders>
    <Border ss:Position="Bottom" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#E2E8F0"/>
    <Border ss:Position="Left" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#E2E8F0"/>
    <Border ss:Position="Right" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#E2E8F0"/>
    <Border ss:Position="Top" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#E2E8F0"/>
   </Borders>
   <Font ss:FontName="Segoe UI" ss:Size="10" ss:Color="#0F172A"/>
  </Style>
  <Style ss:ID="BlankStyle">
   <Alignment ss:Horizontal="Center" ss:Vertical="Center"/>
   <Borders>
    <Border ss:Position="Bottom" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#E2E8F0"/>
    <Border ss:Position="Left" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#E2E8F0"/>
    <Border ss:Position="Right" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#E2E8F0"/>
    <Border ss:Position="Top" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#E2E8F0"/>
   </Borders>
   <Font ss:FontName="Segoe UI" ss:Size="10" ss:Color="#94A3B8"/>
  </Style>
  <Style ss:ID="CurrencyStyle">
   <Alignment ss:Horizontal="Right" ss:Vertical="Center"/>
   <Borders>
    <Border ss:Position="Bottom" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#E2E8F0"/>
    <Border ss:Position="Left" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#E2E8F0"/>
    <Border ss:Position="Right" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#E2E8F0"/>
    <Border ss:Position="Top" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#E2E8F0"/>
   </Borders>
   <Font ss:FontName="Segoe UI" ss:Size="10" ss:Color="#0F172A" ss:Bold="1"/>
   <NumberFormat ss:Format="#,##0"/>
  </Style>
  <Style ss:ID="TotalLabelStyle">
   <Alignment ss:Horizontal="Right" ss:Vertical="Center"/>
   <Borders>
    <Border ss:Position="Top" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#0F172A"/>
    <Border ss:Position="Bottom" ss:LineStyle="Double" ss:Weight="2" ss:Color="#0F172A"/>
   </Borders>
   <Font ss:FontName="Segoe UI" ss:Size="10.5" ss:Color="#0F172A" ss:Bold="1"/>
   <Interior ss:Color="#F8FAFC" ss:Pattern="Solid"/>
  </Style>
  <Style ss:ID="TotalCurrencyStyle">
   <Alignment ss:Horizontal="Right" ss:Vertical="Center"/>
   <Borders>
    <Border ss:Position="Top" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#0F172A"/>
    <Border ss:Position="Bottom" ss:LineStyle="Double" ss:Weight="2" ss:Color="#0F172A"/>
   </Borders>
   <Font ss:FontName="Segoe UI" ss:Size="10.5" ss:Color="#0F172A" ss:Bold="1"/>
   <Interior ss:Color="#F8FAFC" ss:Pattern="Solid"/>
   <NumberFormat ss:Format="#,##0"/>
  </Style>
  <Style ss:ID="TotalBlankStyle">
   <Alignment ss:Horizontal="Center" ss:Vertical="Center"/>
   <Borders>
    <Border ss:Position="Top" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#0F172A"/>
    <Border ss:Position="Bottom" ss:LineStyle="Double" ss:Weight="2" ss:Color="#0F172A"/>
   </Borders>
   <Font ss:FontName="Segoe UI" ss:Size="10.5" ss:Color="#0F172A" ss:Bold="1"/>
   <Interior ss:Color="#F8FAFC" ss:Pattern="Solid"/>
  </Style>
  <Style ss:ID="EmptyNoticeStyle">
   <Alignment ss:Horizontal="Center" ss:Vertical="Center"/>
   <Font ss:FontName="Segoe UI" ss:Size="10" ss:Color="#64748B" ss:Italic="1"/>
   <Interior ss:Color="#F8FAFC" ss:Pattern="Solid"/>
  </Style>
 </Styles>
 <Worksheet ss:Name="Proposals Report">
  <Table ss:DefaultColumnWidth="120" ss:DefaultRowHeight="20">
   <Column ss:Width="190"/> <!-- 1. Reference Number -->
   <Column ss:Width="140"/> <!-- 2. Category -->
   <Column ss:Width="140"/> <!-- 3. Subcategory -->
   <Column ss:Width="160"/> <!-- 4. Faculty Name -->
   <Column ss:Width="260"/> <!-- 5. Event Name -->
   <Column ss:Width="120"/> <!-- 6. Proposed Amount -->
   <Column ss:Width="120"/> <!-- 7. Settlement Amount -->
   <Column ss:Width="110"/> <!-- 8. Proposal Status -->
   <Column ss:Width="130"/> <!-- 9. Settlement Status -->
${rowsXml}  </Table>
 </Worksheet>
</Workbook>`;

  const blob = new Blob([xmlContent], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=utf-8;'
  });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);

  return {
    success: true,
    filename,
    count: proposals.length
  };
};
