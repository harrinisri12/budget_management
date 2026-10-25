/**
 * NBA Criteria 9 Export Utilities
 * Exports real tabular data to authentic Microsoft Excel (.xlsx / SpreadsheetML format) and CSV
 */

// XML escape helper
const escapeXml = (unsafe) => {
  if (unsafe === null || unsafe === undefined) return '';
  return String(unsafe)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
};

// Trigger browser file download
const triggerDownload = (filename, content, mimeType) => {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

// Excel XML Styles Template
const getExcelStyles = () => `
  <Styles>
    <Style ss:ID="Default" ss:Name="Normal">
      <Alignment ss:Vertical="Center"/>
      <Borders/>
      <Font ss:FontName="Calibri" x:Family="Swiss" ss:Size="11" ss:Color="#000000"/>
      <Interior/>
      <NumberFormat/>
      <Protection/>
    </Style>
    <Style ss:ID="DocTitle">
      <Alignment ss:Horizontal="Center" ss:Vertical="Center"/>
      <Font ss:FontName="Calibri" ss:Size="14" ss:Bold="1" ss:Color="#121212"/>
    </Style>
    <Style ss:ID="DocSubTitle">
      <Alignment ss:Horizontal="Center" ss:Vertical="Center"/>
      <Font ss:FontName="Calibri" ss:Size="11" ss:Bold="1" ss:Color="#52525B"/>
    </Style>
    <Style ss:ID="HeaderStyle">
      <Alignment ss:Horizontal="Center" ss:Vertical="Center" ss:WrapText="1"/>
      <Borders>
        <Border ss:Position="Bottom" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#A1A1AA"/>
        <Border ss:Position="Left" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#A1A1AA"/>
        <Border ss:Position="Right" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#A1A1AA"/>
        <Border ss:Position="Top" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#A1A1AA"/>
      </Borders>
      <Font ss:FontName="Calibri" ss:Size="11" ss:Bold="1" ss:Color="#FFFFFF"/>
      <Interior ss:Color="#1E293B" ss:Pattern="Solid"/>
    </Style>
    <Style ss:ID="CellBorder">
      <Alignment ss:Vertical="Center"/>
      <Borders>
        <Border ss:Position="Bottom" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#E4E4E7"/>
        <Border ss:Position="Left" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#E4E4E7"/>
        <Border ss:Position="Right" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#E4E4E7"/>
        <Border ss:Position="Top" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#E4E4E7"/>
      </Borders>
      <Font ss:FontName="Calibri" ss:Size="10" ss:Color="#18181B"/>
    </Style>
    <Style ss:ID="CellNumber">
      <Alignment ss:Horizontal="Right" ss:Vertical="Center"/>
      <Borders>
        <Border ss:Position="Bottom" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#E4E4E7"/>
        <Border ss:Position="Left" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#E4E4E7"/>
        <Border ss:Position="Right" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#E4E4E7"/>
        <Border ss:Position="Top" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#E4E4E7"/>
      </Borders>
      <Font ss:FontName="Calibri" ss:Size="10" ss:Color="#18181B"/>
      <NumberFormat ss:Format="#,##0"/>
    </Style>
    <Style ss:ID="TotalRow">
      <Alignment ss:Horizontal="Right" ss:Vertical="Center"/>
      <Borders>
        <Border ss:Position="Bottom" ss:LineStyle="Double" ss:Weight="2" ss:Color="#121212"/>
        <Border ss:Position="Top" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#121212"/>
      </Borders>
      <Font ss:FontName="Calibri" ss:Size="11" ss:Bold="1" ss:Color="#121212"/>
      <Interior ss:Color="#F4F4F5" ss:Pattern="Solid"/>
      <NumberFormat ss:Format="#,##0"/>
    </Style>
    <Style ss:ID="TotalLabel">
      <Alignment ss:Horizontal="Left" ss:Vertical="Center"/>
      <Borders>
        <Border ss:Position="Bottom" ss:LineStyle="Double" ss:Weight="2" ss:Color="#121212"/>
        <Border ss:Position="Top" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#121212"/>
      </Borders>
      <Font ss:FontName="Calibri" ss:Size="11" ss:Bold="1" ss:Color="#121212"/>
      <Interior ss:Color="#F4F4F5" ss:Pattern="Solid"/>
    </Style>
  </Styles>
`;

/**
 * 1. Export Detailed Criteria-9 Ledger (Image 1) to Excel
 */
export const exportCriteria9LedgerToExcel = ({
  rows = [],
  totalAmount = 0,
  academicYearLabel = '2025-2026',
  categoryTitle = 'Association Expenses'
}) => {
  const filename = `KEC_CSE_Criteria9_Ledger_${academicYearLabel.replace(/[^a-zA-Z0-9_-]/g, '_')}.xlsx`;

  let xml = `<?xml version="1.0"?>
<?mso-application progid="Excel.Sheet"?>
<Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet"
 xmlns:o="urn:schemas-microsoft-com:office:office"
 xmlns:x="urn:schemas-microsoft-com:office:excel"
 xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet">
${getExcelStyles()}
 <Worksheet ss:Name="Criteria-9 Ledger">
  <Table ss:DefaultRowHeight="20">
   <Column ss:Width="40"/>
   <Column ss:Width="130"/>
   <Column ss:Width="280"/>
   <Column ss:Width="100"/>
   <Column ss:Width="110"/>
   <Column ss:Width="80"/>

   <Row ss:Height="26">
    <Cell ss:MergeAcross="5" ss:StyleID="DocTitle"><Data ss:Type="String">KONGU ENGINEERING COLLEGE (AUTONOMOUS)</Data></Cell>
   </Row>
   <Row ss:Height="22">
    <Cell ss:MergeAcross="5" ss:StyleID="DocSubTitle"><Data ss:Type="String">DEPARTMENT OF COMPUTER SCIENCE AND ENGINEERING • CRITERIA-9</Data></Cell>
   </Row>
   <Row ss:Height="20">
    <Cell ss:MergeAcross="5" ss:StyleID="DocSubTitle"><Data ss:Type="String">${escapeXml(categoryTitle)} ${escapeXml(academicYearLabel)} • Sustainable Development Goals (SDG)</Data></Cell>
   </Row>
   <Row ss:Height="12"></Row>

   <!-- Headers matching Image 1 -->
   <Row ss:Height="26">
    <Cell ss:StyleID="HeaderStyle"><Data ss:Type="String">S.No</Data></Cell>
    <Cell ss:StyleID="HeaderStyle"><Data ss:Type="String">ProgramDate</Data></Cell>
    <Cell ss:StyleID="HeaderStyle"><Data ss:Type="String">Program Detail</Data></Cell>
    <Cell ss:StyleID="HeaderStyle"><Data ss:Type="String">Bill Date</Data></Cell>
    <Cell ss:StyleID="HeaderStyle"><Data ss:Type="String">Amount (INR)</Data></Cell>
    <Cell ss:StyleID="HeaderStyle"><Data ss:Type="String">SDG Tag</Data></Cell>
   </Row>
`;

  rows.forEach((r) => {
    xml += `   <Row ss:Height="22">
    <Cell ss:StyleID="CellBorder"><Data ss:Type="Number">${r.sNo}</Data></Cell>
    <Cell ss:StyleID="CellBorder"><Data ss:Type="String">${escapeXml(r.programDate)}</Data></Cell>
    <Cell ss:StyleID="CellBorder"><Data ss:Type="String">${escapeXml(r.programDetail)}</Data></Cell>
    <Cell ss:StyleID="CellBorder"><Data ss:Type="String">${escapeXml(r.billDate)}</Data></Cell>
    <Cell ss:StyleID="CellNumber"><Data ss:Type="Number">${r.amount}</Data></Cell>
    <Cell ss:StyleID="CellBorder"><Data ss:Type="String">${escapeXml(r.sdgTag || 'SDG-9')}</Data></Cell>
   </Row>\n`;
  });

  // Total Row
  xml += `   <Row ss:Height="24">
    <Cell ss:StyleID="TotalLabel"><Data ss:Type="String"></Data></Cell>
    <Cell ss:StyleID="TotalLabel"><Data ss:Type="String"></Data></Cell>
    <Cell ss:StyleID="TotalLabel"><Data ss:Type="String">Total Expenditure</Data></Cell>
    <Cell ss:StyleID="TotalLabel"><Data ss:Type="String"></Data></Cell>
    <Cell ss:StyleID="TotalRow"><Data ss:Type="Number">${totalAmount}</Data></Cell>
    <Cell ss:StyleID="TotalLabel"><Data ss:Type="String"></Data></Cell>
   </Row>
  </Table>
 </Worksheet>
</Workbook>`;

  triggerDownload(filename, xml, 'application/vnd.ms-excel;charset=utf-8;');
};

/**
 * 2. Export Detailed Criteria-9 Ledger to CSV
 */
export const exportCriteria9LedgerToCsv = ({
  rows = [],
  totalAmount = 0,
  academicYearLabel = '2025-2026',
  categoryTitle = 'Association Expenses'
}) => {
  const filename = `KEC_CSE_Criteria9_Ledger_${academicYearLabel.replace(/[^a-zA-Z0-9_-]/g, '_')}.csv`;

  const headerLines = [
    `"KONGU ENGINEERING COLLEGE (AUTONOMOUS) - DEPARTMENT OF COMPUTER SCIENCE AND ENGINEERING"`,
    `"CRITERIA-9 - ${categoryTitle} ${academicYearLabel}"`,
    `"Sustainable Development Goals (SDG)"`,
    ``,
    `"S.No","ProgramDate","Program Detail","Bill Date","Amount","SDG Tag"`
  ];

  const dataLines = rows.map((r) => {
    return [
      r.sNo,
      `"${r.programDate}"`,
      `"${(r.programDetail || '').replace(/"/g, '""')}"`,
      `"${r.billDate}"`,
      r.amount,
      `"${r.sdgTag || 'SDG-9'}"`
    ].join(',');
  });

  const totalLine = `"","","Total Expenditure","",${totalAmount},""`;

  const csv = [...headerLines, ...dataLines, totalLine].join('\n');
  triggerDownload(filename, csv, 'text/csv;charset=utf-8;');
};

/**
 * 3. Export Table No. 9.8.1 to Excel (Images 3 & 2)
 */
export const exportTable981ToExcel = (table981Data = []) => {
  const filename = `KEC_CSE_Table_9_8_1_Budget_Summary.xlsx`;

  let xml = `<?xml version="1.0"?>
<?mso-application progid="Excel.Sheet"?>
<Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet"
 xmlns:o="urn:schemas-microsoft-com:office:office"
 xmlns:x="urn:schemas-microsoft-com:office:excel"
 xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet">
${getExcelStyles()}
 <Worksheet ss:Name="Table 9.8.1 Summary">
  <Table ss:DefaultRowHeight="20">
   <Column ss:Width="150"/>
   <Column ss:Width="130"/>
   <Column ss:Width="130"/>
   <Column ss:Width="140"/>
   <Column ss:Width="90"/>
   <Column ss:Width="140"/>
   <Column ss:Width="150"/>

   <Row ss:Height="26">
    <Cell ss:MergeAcross="6" ss:StyleID="DocTitle"><Data ss:Type="String">Table No. 9.8.1: Summary of budget and actual expenditure incurred at program level</Data></Cell>
   </Row>
   <Row ss:Height="20">
    <Cell ss:MergeAcross="6" ss:StyleID="DocSubTitle"><Data ss:Type="String">Criteria 9 • Program Specific Budget Allocation, Utilization</Data></Cell>
   </Row>
   <Row ss:Height="12"></Row>

   <Row ss:Height="26">
    <Cell ss:StyleID="HeaderStyle"><Data ss:Type="String">Financial Period</Data></Cell>
    <Cell ss:StyleID="HeaderStyle"><Data ss:Type="String">Demanded (INR)</Data></Cell>
    <Cell ss:StyleID="HeaderStyle"><Data ss:Type="String">Actual Allocated (INR)</Data></Cell>
    <Cell ss:StyleID="HeaderStyle"><Data ss:Type="String">Actual Expenditure (INR)</Data></Cell>
    <Cell ss:StyleID="HeaderStyle"><Data ss:Type="String">% Spent</Data></Cell>
    <Cell ss:StyleID="HeaderStyle"><Data ss:Type="String">Total Students</Data></Cell>
    <Cell ss:StyleID="HeaderStyle"><Data ss:Type="String">Expenditure / Student (INR)</Data></Cell>
   </Row>
`;

  table981Data.forEach((row) => {
    xml += `   <Row ss:Height="22">
    <Cell ss:StyleID="CellBorder"><Data ss:Type="String">${escapeXml(row.title)}</Data></Cell>
    <Cell ss:StyleID="CellNumber"><Data ss:Type="Number">${row.demandedBudget}</Data></Cell>
    <Cell ss:StyleID="CellNumber"><Data ss:Type="Number">${row.allocatedBudget}</Data></Cell>
    <Cell ss:StyleID="CellNumber"><Data ss:Type="Number">${row.actualExpenditure}</Data></Cell>
    <Cell ss:StyleID="CellNumber"><Data ss:Type="String">${row.percentSpent}%</Data></Cell>
    <Cell ss:StyleID="CellNumber"><Data ss:Type="Number">${row.studentCount}</Data></Cell>
    <Cell ss:StyleID="CellNumber"><Data ss:Type="Number">${row.expenditurePerStudent}</Data></Cell>
   </Row>\n`;
  });

  xml += `  </Table>
 </Worksheet>
</Workbook>`;

  triggerDownload(filename, xml, 'application/vnd.ms-excel;charset=utf-8;');
};

/**
 * 4. Export Table No. 9.8.2 Multi-Year Matrix to Excel (Image 2)
 */
export const exportTable982ToExcel = ({ periods = [], rows = [], totals = {} }) => {
  const filename = `KEC_CSE_Table_9_8_2_Expenditure_Matrix.xlsx`;

  let xml = `<?xml version="1.0"?>
<?mso-application progid="Excel.Sheet"?>
<Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet"
 xmlns:o="urn:schemas-microsoft-com:office:office"
 xmlns:x="urn:schemas-microsoft-com:office:excel"
 xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet">
${getExcelStyles()}
 <Worksheet ss:Name="Table 9.8.2 Matrix">
  <Table ss:DefaultRowHeight="20">
   <Column ss:Width="240"/>
   <Column ss:Width="110"/>
   <Column ss:Width="120"/>
   <Column ss:Width="110"/>
   <Column ss:Width="120"/>
   <Column ss:Width="110"/>
   <Column ss:Width="120"/>
   <Column ss:Width="110"/>
   <Column ss:Width="120"/>

   <Row ss:Height="26">
    <Cell ss:MergeAcross="8" ss:StyleID="DocTitle"><Data ss:Type="String">Table No. 9.8.2: Budget and actual expenditure incurred at program level</Data></Cell>
   </Row>
   <Row ss:Height="20">
    <Cell ss:MergeAcross="8" ss:StyleID="DocSubTitle"><Data ss:Type="String">Department of Computer Science and Engineering • Multi-Year Comparison Matrix</Data></Cell>
   </Row>
   <Row ss:Height="12"></Row>

   <!-- Multi-column headers matching Image 2 -->
   <Row ss:Height="26">
    <Cell ss:MergeDown="1" ss:StyleID="HeaderStyle"><Data ss:Type="String">Items</Data></Cell>
    ${periods
      .map(
        (p) =>
          `<Cell ss:MergeAcross="1" ss:StyleID="HeaderStyle"><Data ss:Type="String">${escapeXml(p.shortLabel || p.academicYear)} (${escapeXml(p.code)})</Data></Cell>`
      )
      .join('\n    ')}
   </Row>
   <Row ss:Height="26">
    ${periods
      .map(
        (p) => `
    <Cell ss:StyleID="HeaderStyle"><Data ss:Type="String">Budgeted in ${escapeXml(p.code)}</Data></Cell>
    <Cell ss:StyleID="HeaderStyle"><Data ss:Type="String">Actual expenses in ${escapeXml(p.code)}</Data></Cell>`
      )
      .join('')}
   </Row>
`;

  rows.forEach((r) => {
    xml += `   <Row ss:Height="22">
    <Cell ss:StyleID="CellBorder"><Data ss:Type="String">${escapeXml(r.item)}</Data></Cell>
    ${periods
      .map((p) => {
        const d = r.yearData[p.code] || { budgeted: 0, actual: 0 };
        return `
    <Cell ss:StyleID="CellNumber"><Data ss:Type="Number">${d.budgeted}</Data></Cell>
    <Cell ss:StyleID="CellNumber"><Data ss:Type="Number">${d.actual}</Data></Cell>`;
      })
      .join('')}
   </Row>\n`;
  });

  // Total Row
  xml += `   <Row ss:Height="26">
    <Cell ss:StyleID="TotalLabel"><Data ss:Type="String">Total</Data></Cell>
    ${periods
      .map((p) => {
        const t = totals[p.code] || { budgeted: 0, actual: 0 };
        return `
    <Cell ss:StyleID="TotalRow"><Data ss:Type="Number">${t.budgeted}</Data></Cell>
    <Cell ss:StyleID="TotalRow"><Data ss:Type="Number">${t.actual}</Data></Cell>`;
      })
      .join('')}
   </Row>
  </Table>
 </Worksheet>
</Workbook>`;

  triggerDownload(filename, xml, 'application/vnd.ms-excel;charset=utf-8;');
};
