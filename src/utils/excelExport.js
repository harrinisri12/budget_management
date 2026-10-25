/**
 * Utility to export proposals to Microsoft Excel (.xls / SpreadsheetML format)
 * Supporting exact column ordering, number formatting, and interactive clickable hyperlinks.
 */

// Helper to escape XML characters
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
 * Export proposals list to Microsoft Excel with exact required columns:
 * 1. Reference Number
 * 2. Category
 * 3. Subcategory
 * 4. Faculty Name
 * 5. Event Name
 * 6. Proposed Amount
 * 7. Settlement Amount
 * 8. Proposal Status
 * 9. Settlement Status
 * 10. Uploaded File Link
 */
export const exportProposalsToExcel = (proposals = [], academicYearLabel = 'Current') => {
  const today = new Date().toISOString().split('T')[0];
  const filename = `College_Budget_Proposals_${today}.xlsx`;

  const headers = [
    'Reference Number',
    'Category',
    'Subcategory',
    'Faculty Name',
    'Event Name',
    'Proposed Amount',
    'Settlement Amount',
    'Proposal Status',
    'Settlement Status',
    'Uploaded File Link'
  ];

  let rowsXml = '';

  // Header Row
  rowsXml += '   <Row ss:Height="26">\n';
  headers.forEach((h) => {
    rowsXml += `    <Cell ss:StyleID="HeaderStyle"><Data ss:Type="String">${escapeXml(h)}</Data></Cell>\n`;
  });
  rowsXml += '   </Row>\n';

  // Data Rows
  (proposals || []).forEach((p) => {
    const refNumber = p.proposalNumber || p.proposalId || p.id || '—';
    const category = p.category || p.budget_categories?.name || 'Department Activity';
    const subcategory = p.subCategory || p.sub_category || '—';
    const facultyName = p.facultyName || p.profiles?.name || 'Faculty Member';
    const eventName = p.title || '—';
    const proposedAmount = Number(p.amount || 0);

    const isSettled = String(p.settlementStatus || p.settlement_status || '').toLowerCase() === 'settled';
    const settlementAmountVal = (isSettled && p.settlementAmount !== null && p.settlementAmount !== undefined)
      ? Number(p.settlementAmount)
      : (p.settlementAmount !== null && p.settlementAmount !== undefined && p.settlementAmount !== '' ? Number(p.settlementAmount) : null);

    const proposalStatus = p.status || 'Pending';
    let settlementStatus = 'Unsettled';
    const normSettlement = String(p.settlementStatus || p.settlement_status || '').toLowerCase();
    if (normSettlement === 'settled') {
      settlementStatus = 'Settled';
    } else if (normSettlement === 'pending_settlement') {
      settlementStatus = 'Pending Settlement';
    }

    const fileLink = getProposalFileLink(p);

    rowsXml += '   <Row ss:Height="20">\n';
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
    // 6. Proposed Amount
    rowsXml += `    <Cell ss:StyleID="CurrencyStyle"><Data ss:Type="Number">${proposedAmount}</Data></Cell>\n`;
    // 7. Settlement Amount
    if (settlementAmountVal !== null) {
      rowsXml += `    <Cell ss:StyleID="CurrencyStyle"><Data ss:Type="Number">${settlementAmountVal}</Data></Cell>\n`;
    } else {
      rowsXml += `    <Cell ss:StyleID="TextStyle"><Data ss:Type="String">—</Data></Cell>\n`;
    }
    // 8. Proposal Status
    rowsXml += `    <Cell ss:StyleID="CenterStyle"><Data ss:Type="String">${escapeXml(proposalStatus)}</Data></Cell>\n`;
    // 9. Settlement Status
    rowsXml += `    <Cell ss:StyleID="CenterStyle"><Data ss:Type="String">${escapeXml(settlementStatus)}</Data></Cell>\n`;
    // 10. Uploaded File Link (Hyperlink if URL, else exactly 'Not Uploaded')
    if (fileLink !== 'Not Uploaded') {
      rowsXml += `    <Cell ss:StyleID="HyperlinkStyle" ss:HRef="${escapeXml(fileLink)}"><Data ss:Type="String">${escapeXml(fileLink)}</Data></Cell>\n`;
    } else {
      rowsXml += `    <Cell ss:StyleID="CenterStyle"><Data ss:Type="String">Not Uploaded</Data></Cell>\n`;
    }
    rowsXml += '   </Row>\n';
  });

  const xmlContent = `<?xml version="1.0" encoding="UTF-8"?>
<?mso-application progid="Excel.Sheet"?>
<Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet"
 xmlns:o="urn:schemas-microsoft-com:office:office"
 xmlns:x="urn:schemas-microsoft-com:office:excel"
 xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet"
 xmlns:html="http://www.w3.org/TR/REC-html40">
 <DocumentProperties xmlns="urn:schemas-microsoft-com:office:office">
  <Title>KEC CSE Proposals Register</Title>
  <Subject>College Budget Management System Proposals &amp; Settlements</Subject>
  <Author>Kongu Engineering College</Author>
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
    <Border ss:Position="Bottom" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#CBD5E1"/>
    <Border ss:Position="Top" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#CBD5E1"/>
    <Border ss:Position="Left" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#CBD5E1"/>
    <Border ss:Position="Right" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#CBD5E1"/>
   </Borders>
   <Font ss:FontName="Segoe UI" ss:Size="10.5" ss:Color="#FFFFFF" ss:Bold="1"/>
   <Interior ss:Color="#0F172A" ss:Pattern="Solid"/>
  </Style>
  <Style ss:ID="TextStyle">
   <Alignment ss:Vertical="Center"/>
   <Borders>
    <Border ss:Position="Bottom" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#F1F5F9"/>
   </Borders>
   <Font ss:FontName="Segoe UI" ss:Size="10" ss:Color="#0F172A"/>
  </Style>
  <Style ss:ID="CenterStyle">
   <Alignment ss:Horizontal="Center" ss:Vertical="Center"/>
   <Borders>
    <Border ss:Position="Bottom" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#F1F5F9"/>
   </Borders>
   <Font ss:FontName="Segoe UI" ss:Size="10" ss:Color="#0F172A"/>
  </Style>
  <Style ss:ID="CurrencyStyle">
   <Alignment ss:Horizontal="Right" ss:Vertical="Center"/>
   <Borders>
    <Border ss:Position="Bottom" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#F1F5F9"/>
   </Borders>
   <Font ss:FontName="Segoe UI" ss:Size="10" ss:Color="#0F172A" ss:Bold="1"/>
   <NumberFormat ss:Format="#,##0"/>
  </Style>
  <Style ss:ID="HyperlinkStyle">
   <Alignment ss:Vertical="Center"/>
   <Borders>
    <Border ss:Position="Bottom" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#F1F5F9"/>
   </Borders>
   <Font ss:FontName="Segoe UI" ss:Size="10" ss:Color="#0284C7" ss:Underline="Single"/>
  </Style>
 </Styles>
 <Worksheet ss:Name="Proposals">
  <Table ss:DefaultColumnWidth="120" ss:DefaultRowHeight="20">
   <Column ss:Width="160"/>
   <Column ss:Width="130"/>
   <Column ss:Width="130"/>
   <Column ss:Width="140"/>
   <Column ss:Width="220"/>
   <Column ss:Width="110"/>
   <Column ss:Width="110"/>
   <Column ss:Width="100"/>
   <Column ss:Width="120"/>
   <Column ss:Width="240"/>
${rowsXml}  </Table>
 </Worksheet>
</Workbook>`;

  const blob = new Blob([xmlContent], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};
