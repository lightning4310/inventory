import { useState, useEffect } from 'react';
import { getSuppliers, createSupplier, updateSupplier, deleteSupplier } from "../api/api";
import { toast } from 'react-toastify';

export default function SupplierList() {
  const [suppliers, setSuppliers] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEmailModalOpen, setIsEmailModalOpen] = useState(false);
  const [currentSupplier, setCurrentSupplier] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    contactPerson: '',
    phone: '',
    email: '',
    address: '',
    notes: ''
  });
  const [emailData, setEmailData] = useState({
    to: '',
    subject: '',
    body: ''
  });

  // Fetch suppliers
  useEffect(() => {
    fetchSuppliers();
  }, []);

  const fetchSuppliers = async () => {
    try {
      const { data } = await getSuppliers();
      setSuppliers(data);
    } catch (error) {
      toast.error('Failed to load suppliers');
    }
  };

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // Handle email input changes
  const handleEmailChange = (e) => {
    const { name, value } = e.target;
    setEmailData(prev => ({ ...prev, [name]: value }));
  };

  // Open modal for add/edit
  const openModal = (supplier = null) => {
    setCurrentSupplier(supplier);
    setFormData(supplier ? { ...supplier } : {
      name: '',
      contactPerson: '',
      phone: '',
      email: '',
      address: '',
      notes: ''
    });
    setIsModalOpen(true);
  };

  // Open email modal
  const openEmailModal = (supplier) => {
    setEmailData({
      to: supplier.email,
      subject: 'Regarding your supply order',
      body: `Dear ${supplier.contactPerson || supplier.name},\n\n`
    });
    setIsEmailModalOpen(true);
  };

  // Submit supplier form
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (currentSupplier) {
        await updateSupplier(currentSupplier._id, formData);
        toast.success('Supplier updated successfully');
      } else {
        await createSupplier(formData);
        toast.success('Supplier added successfully');
      }
      setIsModalOpen(false);
      fetchSuppliers();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Operation failed');
    }
  };

  // Delete supplier
  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this supplier?')) {
      try {
        await deleteSupplier(id);
        toast.success('Supplier deleted');
        fetchSuppliers();
      } catch (error) {
        toast.error('Delete failed');
      }
    }
  };

  // Send email using mailto
  const sendEmail = (e) => {
    e.preventDefault();
    if (!emailData.to) {
      toast.error('No email address specified');
      return;
    }
  
    // Create Gmail compose URL
    const gmailUrl = `https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(emailData.to)}&su=${encodeURIComponent(emailData.subject)}&body=${encodeURIComponent(emailData.body)}`;
    
    // Open in new tab
    window.open(gmailUrl, '_blank');
    setIsEmailModalOpen(false);
  };
  
  return (
    <div className="pl-64 pr-6 py-6 bg-gradient-to-br from-slate-50 to-slate-100 min-h-screen">
      <div className="max-w-7xl mx-auto">
        {/* Header Section */}
        <div className="bg-white rounded-xl shadow-md border border-slate-200 p-8 mb-8 bg-gradient-to-r from-white to-indigo-50">
          <div className="flex items-center">
            <div>
              <h2 className="text-3xl font-bold text-gray-700">
                <span className="text-indigo-800">Supplier Management</span> 
              </h2>
              <p className="text-gray-500 mt-2">Manage your supplier relationships efficiently</p>
            </div>
          </div>
        </div>

        {/* Action Bar */}
        <div className="flex justify-between items-center mb-6">
          <div className="text-slate-700">
            <span className="font-medium">{suppliers.length}</span> suppliers found
          </div>
          <button
            onClick={() => openModal()}
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-lg shadow-md transition duration-200 ease-in-out flex items-center gap-2"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
            </svg>
            Add New Supplier
          </button>
        </div>

        {/* Suppliers Table */}
        <div className="overflow-hidden bg-white rounded-xl shadow-md border border-slate-200">
          <table className="min-w-full divide-y divide-slate-200">
            <thead className="bg-gradient-to-r from-slate-100 to-indigo-50">
              <tr>
                <th className="py-4 px-6 text-left text-xs font-medium text-slate-700 uppercase tracking-wider">Name</th>
                <th className="py-4 px-6 text-left text-xs font-medium text-slate-700 uppercase tracking-wider">Contact</th>
                <th className="py-4 px-6 text-left text-xs font-medium text-slate-700 uppercase tracking-wider">Phone</th>
                <th className="py-4 px-6 text-left text-xs font-medium text-slate-700 uppercase tracking-wider">Email</th>
                <th className="py-4 px-6 text-left text-xs font-medium text-slate-700 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 bg-white">
              {suppliers.length > 0 ? (
                suppliers.map((supplier) => (
                  <tr key={supplier._id} className="hover:bg-indigo-50/30 transition-colors duration-150">
                    <td className="py-4 px-6 text-sm font-medium text-slate-800">{supplier.name || 'N/A'}</td>
                    <td className="py-4 px-6 text-sm text-slate-700">{supplier.contactPerson || 'N/A'}</td>
                    <td className="py-4 px-6 text-sm text-slate-700">{supplier.phone || 'N/A'}</td>
                    <td className="py-4 px-6 text-sm text-slate-700">{supplier.email || 'N/A'}</td>
                    <td className="py-4 px-6 text-sm">
                      <div className="flex space-x-3">
                        <button
                          onClick={() => openModal(supplier)}
                          className="text-indigo-600 hover:text-indigo-800 transition-colors p-1 rounded-full hover:bg-indigo-100"
                          title="Edit"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                            <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                          </svg>
                        </button>
                        <button
                          onClick={() => handleDelete(supplier._id)}
                          className="text-rose-600 hover:text-rose-800 transition-colors p-1 rounded-full hover:bg-rose-100"
                          title="Delete"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                          </svg>
                        </button>
                        {supplier.email && (
                          <button
                            onClick={() => openEmailModal(supplier)}
                            className="text-emerald-600 hover:text-emerald-800 transition-colors p-1 rounded-full hover:bg-emerald-100"
                            title="Email"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                              <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                              <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                            </svg>
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="py-8 text-center">
                    <div className="flex flex-col items-center justify-center text-slate-500">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-slate-300 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                      </svg>
                      <p className="text-lg font-medium">No suppliers found</p>
                      <p className="text-sm">Add a new supplier to get started</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Supplier Add/Edit Modal */}
        {isModalOpen && (
          <div className="fixed inset-0 bg-slate-900 bg-opacity-70 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
            <div className="bg-white rounded-xl p-6 w-full max-w-md shadow-xl border border-slate-200">
              <div className="flex items-center mb-4 pb-2 border-b border-slate-200">
                <div className="w-8 h-8 bg-indigo-100 rounded-lg flex items-center justify-center mr-3">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-indigo-700" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
                  </svg>
                </div>
                <h2 className="text-xl font-bold text-slate-800">
                  {currentSupplier ? 'Edit Supplier' : 'Add New Supplier'}
                </h2>
              </div>
              <form onSubmit={handleSubmit}>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-1 text-slate-700">Name*</label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      className="w-full p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-300 focus:border-indigo-500 outline-none transition"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1 text-slate-700">Contact Person</label>
                    <input
                      type="text"
                      name="contactPerson"
                      value={formData.contactPerson}
                      onChange={handleInputChange}
                      className="w-full p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-300 focus:border-indigo-500 outline-none transition"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1 text-slate-700">Phone*</label>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      className="w-full p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-300 focus:border-indigo-500 outline-none transition"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1 text-slate-700">Email</label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      className="w-full p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-300 focus:border-indigo-500 outline-none transition"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1 text-slate-700">Address</label>
                    <input
                      type="text"
                      name="address"
                      value={formData.address}
                      onChange={handleInputChange}
                      className="w-full p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-300 focus:border-indigo-500 outline-none transition"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1 text-slate-700">Notes</label>
                    <textarea
                      name="notes"
                      value={formData.notes}
                      onChange={handleInputChange}
                      className="w-full p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-300 focus:border-indigo-500 outline-none transition"
                      rows="3"
                    />
                  </div>
                  <div className="flex justify-end space-x-3 pt-4 border-t border-slate-200 mt-6">
                    <button
                      type="button"
                      onClick={() => setIsModalOpen(false)}
                      className="px-4 py-2.5 border border-slate-300 rounded-lg text-slate-700 hover:bg-slate-50 transition"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 shadow-sm transition flex items-center gap-2"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                      {currentSupplier ? 'Update' : 'Save'}
                    </button>
                  </div>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Email Modal */}
        {isEmailModalOpen && (
          <div className="fixed inset-0 bg-slate-900 bg-opacity-70 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
            <div className="bg-white rounded-xl p-6 w-full max-w-md shadow-xl border border-slate-200">
              <div className="flex items-center mb-4 pb-2 border-b border-slate-200">
                <div className="w-8 h-8 bg-emerald-100 rounded-lg flex items-center justify-center mr-3">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-emerald-700" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                    <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                  </svg>
                </div>
                <h2 className="text-xl font-bold text-slate-800">Send Email to Supplier</h2>
              </div>
              <form onSubmit={sendEmail}>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-1 text-slate-700">To</label>
                    <div className="w-full p-2.5 border border-slate-300 rounded-lg bg-slate-50 text-slate-700 flex items-center">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-slate-400 mr-2" viewBox="0 0 20 20" fill="currentColor">
                        <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                        <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                      </svg>
                      <span>{emailData.to}</span>
                      <input type="hidden" name="to" value={emailData.to} required />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1 text-slate-700">Subject*</label>
                    <input
                      type="text"
                      name="subject"
                      value={emailData.subject}
                      onChange={handleEmailChange}
                      className="w-full p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-300 focus:border-emerald-500 outline-none transition"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1 text-slate-700">Message*</label>
                    <textarea
                      name="body"
                      value={emailData.body}
                      onChange={handleEmailChange}
                      className="w-full p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-300 focus:border-emerald-500 outline-none transition"
                      rows="5"
                      required
                    />
                  </div>
                  <div className="flex justify-end space-x-3 pt-4 border-t border-slate-200 mt-6">
                    <button
                      type="button"
                      onClick={() => setIsEmailModalOpen(false)}
                      className="px-4 py-2.5 border border-slate-300 rounded-lg text-slate-700 hover:bg-slate-50 transition"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2.5 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 shadow-sm transition flex items-center gap-2"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" />
                      </svg>
                      Send Email
                    </button>
                  </div>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}