import React, { useEffect, useState } from "react";
import API from "../api/api";
import { useNavigate } from "react-router-dom";
import { 
  FaShoppingCart, 
  FaCalendarAlt, 
  FaRupeeSign, 
  FaBoxes, 

  FaFilePdf, 
  FaFileExcel,
  FaChartLine,
  FaExclamationTriangle
} from "react-icons/fa";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import * as XLSX from "xlsx";

const MonthlyYearlySalesReport = () => {
  const [salesReport, setSalesReport] = useState([]);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState("monthly");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchSalesReport = async () => {
      try {
        const token = localStorage.getItem("token");

        if (!token) {
          navigate("/login");
          return;
        }

        API.defaults.headers.common["Authorization"] = `Bearer ${token}`;
        const response = await API.get(`/sales/report?period=${period}`);
        setSalesReport(Array.isArray(response.data) ? response.data : []);
      } catch (error) {
        console.error("Error fetching sales report:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchSalesReport();
  }, [navigate, period]);

  // Calculate total sales and total quantity for the selected period
  const totalSales = salesReport.reduce((acc, sale) => acc + (sale.totalMoneyEarned || 0), 0);
  const totalQuantity = salesReport.reduce((acc, sale) => acc + (sale.totalQuantitySold || 0), 0);
  const totalProfit = salesReport.reduce((acc, sale) => acc + (sale.price - sale.buyingPrice) * sale.totalQuantitySold, 0);
  const totalProducts = salesReport.length;

  // Function to generate PDF
 // Function to generate PDF
const generatePDF = () => {
  const table = document.getElementById("sales-report-table");

  if (!table) {
    console.error("Table not found in the DOM.");
    return;
  }

  // Create a container for the report
  const container = document.createElement("div");
  container.style.padding = "20px";
  container.style.fontFamily = "Arial, sans-serif";

  // Title
  const title = document.createElement("h2");
  title.textContent = "Inventory Management System - Sales Report";
  title.style.textAlign = "center";
  title.style.fontSize = "20px";
  title.style.fontWeight = "bold";
  title.style.marginBottom = "20px";
  container.appendChild(title);

  // Clone the table but don't modify it yet
  const clonedTable = table.cloneNode(true);
  
  // Style the cloned table for better appearance in PDF
  clonedTable.style.width = "100%";
  clonedTable.style.borderCollapse = "collapse";
  clonedTable.style.marginTop = "15px";
  
  // Style table headers and cells
  const allCells = clonedTable.querySelectorAll("th, td");
  allCells.forEach(cell => {
    cell.style.border = "1px solid #e0e0e0";
    cell.style.padding = "8px";
    cell.style.textAlign = "left";
  });
  
  // Style headers
  const headers = clonedTable.querySelectorAll("th");
  headers.forEach(header => {
    header.style.backgroundColor = "#f4f4f4";
    header.style.fontWeight = "bold";
  });
  
  // Style the footer row
  const footerRow = clonedTable.querySelector("tfoot tr");
  if (footerRow) {
    footerRow.style.backgroundColor = "#f4f4f4";
    const footerCells = footerRow.querySelectorAll("td");
    footerCells.forEach(cell => {
      cell.style.fontWeight = "bold";
    });
  }

  // Add the styled table to the container
  container.appendChild(clonedTable);
  
  // Append the container to the body temporarily
  document.body.appendChild(container);

  // Generate the PDF
  html2canvas(container, {
    logging: true,
    useCORS: true,
    scale: 2, // Increase resolution
  })
    .then((canvas) => {
      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF("p", "mm", "a4");
      const imgWidth = 210;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      pdf.addImage(imgData, "PNG", 0, 0, imgWidth, imgHeight);
      pdf.save("sales-report.pdf");
      document.body.removeChild(container);
    })
    .catch((error) => {
      console.error("Error generating PDF:", error);
      document.body.removeChild(container);
    });
};

  // Function to generate Excel sheet
  const generateExcel = () => {
    // Create an array to hold the worksheet data
    const worksheetData = [
      // Title row
      ["Inventory Management System - Sales Report"],
      [], // Empty row for spacing
      
      // Headers for sales data
      [
        "Product Name", 
        "Buying Price (₹)", 
        "Selling Price (₹)", 
        "Profit (₹)", 
        "Quantity Sold", 
        "Total Revenue (₹)"
      ],
    ];
  
    // Add sales report data
    const reportRows = salesReport.map((sale) => {
      const profit = (sale.price - sale.buyingPrice) * sale.totalQuantitySold;
      return [
        sale.productName,
        sale.buyingPrice.toFixed(2),
        sale.price.toFixed(2),
        profit.toFixed(2),
        sale.totalQuantitySold,
        sale.totalMoneyEarned.toFixed(2)
      ];
    });
  
    // Add data rows to worksheet
    worksheetData.push(...reportRows);
  
    // Add total row
    worksheetData.push(
      [], // Empty row for spacing
      [
        "Total:", 
        "", 
        "", 
        totalProfit.toFixed(2), 
        totalQuantity, 
        totalSales.toFixed(2)
      ]
    );
  
    // Create worksheet
    const worksheet = XLSX.utils.aoa_to_sheet(worksheetData);
  
    // Customize column widths
    worksheet['!cols'] = [
      { wch: 25 }, // Product Name
      { wch: 15 }, // Buying Price
      { wch: 15 }, // Selling Price
      { wch: 15 }, // Profit
      { wch: 15 }, // Quantity Sold
      { wch: 15 }  // Total Revenue
    ];
  
    // Style the header rows
    const headerRowIndexes = [0, 2]; // Title and column headers
    headerRowIndexes.forEach(rowIndex => {
      Object.keys(worksheet).forEach(cell => {
        if (cell.startsWith(String.fromCharCode(65 + 0) + (rowIndex + 1))) {
          worksheet[cell].s = {
            font: { bold: true },
            alignment: { horizontal: 'center' }
          };
        }
      });
    });
  
    // Create workbook and save
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Sales Report");
    XLSX.writeFile(workbook, "sales-report.xlsx");
  };

  return (
    <div className="ml-64 bg-gray-50 min-h-screen">
      {/* Header Section */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
          <h2 className="text-3xl font-bold text-gray-700">
             <span className="text-indigo-800">Sales Report</span> 
          </h2>
          <p className="text-gray-500 mt-2">Here's an overview of your sales data</p>
        </div>

      {/* Controls and Filters */}
      <div className="mx-6 mb-6 p-4 bg-white rounded-lg shadow-sm flex justify-between items-center">
        <div className="flex items-center space-x-4">
          <label htmlFor="period" className="font-medium text-gray-700">View:</label>
          <select
            id="period"
            value={period}
            onChange={(e) => setPeriod(e.target.value)}
            className="p-2 border border-gray-300 rounded-md bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="monthly">Monthly</option>
            <option value="yearly">Yearly</option>
          </select>
        </div>
        
        <div className="flex items-center space-x-3">
          <button
            onClick={generatePDF}
            className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-md flex items-center transition-colors"
          >
            <FaFilePdf className="mr-2" /> <span>Export PDF</span>
          </button>
          <button
            onClick={generateExcel}
            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md flex items-center transition-colors"
          >
            <FaFileExcel className="mr-2" /> <span>Export Excel</span>
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mx-6 mb-6">
        {/* Total Stock Card */}
        <div className="bg-white p-6 rounded-lg shadow-sm flex items-start border-l-4 border-blue-500">
          <div className="bg-yellow-100 p-3 rounded-lg">
           <FaBoxes className="text-amber-500 text-2xl" />
          </div>
          <div className="ml-4">
             <p className="text-gray-600 text-sm">Total Products</p>
            <h3 className="text-3xl font-bold">{totalProducts}</h3>
          </div>
        </div>

        {/* Total Products Card */}
        <div className="bg-white p-6 rounded-lg shadow-sm flex items-start border-l-4 border-yellow-500">
          <div className="bg-yellow-100 p-3 rounded-lg">
            <FaShoppingCart className="text-yellow-500 text-xl" />
          </div>
          <div className="ml-4">
          <p className="text-gray-600 text-sm">Total Quantity Sold</p>
          <h3 className="text-3xl font-bold">{totalQuantity}</h3>
           
          </div>
        </div>

        {/* Total Sales Card */}
        <div className="bg-white p-6 rounded-lg shadow-sm flex items-start border-l-4 border-green-500">
          <div className="bg-green-100 p-3 rounded-lg">
            <FaRupeeSign className="text-green-500 text-xl" />
          </div>
          <div className="ml-4">
            <p className="text-gray-600 text-sm">Total Sales</p>
            <h3 className="text-3xl font-bold">₹{totalSales.toFixed(2)}</h3>
          </div>
        </div>

        {/* Total Profit Card */}
        <div className="bg-white p-6 rounded-lg shadow-sm flex items-start border-l-4 border-green-500">
          <div className="bg-green-100 p-3 rounded-lg">
            <FaChartLine className="text-green-500 text-xl" />
          </div>
          <div className="ml-4">
            <p className="text-gray-600 text-sm">Total Profit</p>
            <h3 className="text-3xl font-bold">₹{totalProfit.toFixed(2)}</h3>
          </div>
        </div>
      </div>

      {/* Sales Table */}
      <div className="mx-6 bg-white p-6 rounded-lg shadow-sm mb-6">
        <h3 className="text-xl font-semibold mb-4 flex items-center">
          <FaShoppingCart className="mr-2 text-blue-500" /> 
          Sales Report
        </h3>
        
        {loading ? (
          <div className="flex justify-center items-center h-40">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table id="sales-report-table" className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Product Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Buying Price (₹)</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Selling Price (₹)</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Profit (₹)</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Quantity Sold</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total Revenue (₹)</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {salesReport.length > 0 ? (
                  salesReport.map((sale) => {
                    const profit = (sale.price - sale.buyingPrice) * sale.totalQuantitySold;
                    return (
                      <tr key={sale.productId} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap">{sale.productName}</td>
                        <td className="px-6 py-4 whitespace-nowrap">₹{sale.buyingPrice.toFixed(2)}</td>
                        <td className="px-6 py-4 whitespace-nowrap">₹{sale.price.toFixed(2)}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-green-600 font-medium">₹{profit.toFixed(2)}</td>
                        <td className="px-6 py-4 whitespace-nowrap">{sale.totalQuantitySold}</td>
                        <td className="px-6 py-4 whitespace-nowrap">₹{sale.totalMoneyEarned.toFixed(2)}</td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan="6" className="px-6 py-10 text-center text-gray-500">
                      <FaExclamationTriangle className="mx-auto mb-2 text-yellow-500 text-xl" />
                      <p>No sales data available for the selected period.</p>
                    </td>
                  </tr>
                )}
              </tbody>
              {salesReport.length > 0 && (
                <tfoot className="bg-gray-50">
                  <tr>
                    <td colSpan="3" className="px-6 py-4 text-right font-bold">Total:</td>
                    <td className="px-6 py-4 whitespace-nowrap text-green-600 font-bold">₹{totalProfit.toFixed(2)}</td>
                    <td className="px-6 py-4 whitespace-nowrap font-bold">{totalQuantity}</td>
                    <td className="px-6 py-4 whitespace-nowrap font-bold">₹{totalSales.toFixed(2)}</td>
                  </tr>
                </tfoot>
              )}
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default MonthlyYearlySalesReport;