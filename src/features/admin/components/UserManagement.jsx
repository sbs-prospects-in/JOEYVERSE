import React from 'react';
import { Search, CheckCircle } from 'lucide-react';

export default function UserManagement({
  activeTab,
  searchQuery,
  setSearchQuery,
  filteredDoctors,
  filteredOwners,
  wallets,
  pets,
  handleApproveRate,
  handleRejectRate,
  handleUpdateDoctorStatus
}) {
  return (
    <>
      {/* DOCTORS TAB */}
      {activeTab === 'doctors' && (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl font-black text-slate-900">Doctor Management</h1>
              <p className="text-slate-500 font-medium mt-1">Verify, approve, or ban doctors.</p>
            </div>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input
                type="text"
                placeholder="Search doctors..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 pr-4 py-2 border border-slate-200 rounded-xl w-full sm:w-64 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
              />
            </div>
          </div>

          <div className="bg-white rounded-3xl border border-slate-200 shadow-[0_8px_30px_rgb(0,0,0,0.04)] overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm border-collapse">
                <thead className="bg-slate-50/80 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider text-xs">
                  <tr>
                    <th className="px-6 py-5">Doctor Profile</th>
                    <th className="px-6 py-5">Specialization</th>
                    <th className="px-6 py-5">Consultation Rate</th>
                    <th className="px-6 py-5">License & Phone</th>
                    <th className="px-6 py-5">Verification Status</th>
                    <th className="px-6 py-5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredDoctors.map(doc => (
                    <tr key={doc.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center shrink-0 border border-slate-200 overflow-hidden">
                            {doc.profile_image_url ? (
                              <img src={doc.profile_image_url} alt="" className="w-full h-full object-cover" />
                            ) : (
                              <span className="text-slate-500 font-bold">{doc.name ? doc.name.charAt(0) : '?'}</span>
                            )}
                          </div>
                          <div>
                            <p className="font-bold text-slate-900">{doc.name || 'Unknown Doctor'}</p>
                            <p className="text-slate-500 text-xs">Rating: {doc.rating || 'New'} ⭐ ({doc.reviews_count || 0} reviews)</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 font-medium text-slate-600">
                        <div>{doc.specialization || 'General'}</div>
                        <div className="text-xs text-slate-500">{doc.experience || 'New'}</div>
                      </td>
                      <td className="px-6 py-4 font-bold text-slate-900">
                        <div>₹{doc.per_minute_rate || 0}/min</div>
                        {doc.pending_rate_request && (
                          <div className="text-xs text-amber-600 mt-1 font-semibold flex flex-col gap-1">
                            <span>Requested: ₹{doc.pending_rate_request}/min</span>
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm font-semibold text-slate-700">{doc.license_number || 'N/A'}</div>
                        <div className="text-xs text-slate-500">{doc.phone || 'No Phone'}</div>
                      </td>
                      <td className="px-6 py-4">
                        {doc.verified ? (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-600 border border-emerald-200">
                            <CheckCircle size={12} /> Approved
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-slate-50 text-slate-500 border border-slate-200">
                            <CheckCircle size={12} /> Pending
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-end gap-2 flex-wrap">
                            {doc.pending_rate_request && (
                              <div className="flex items-center gap-1 mr-2 border-r border-slate-200 pr-2">
                                <button 
                                  onClick={() => handleApproveRate(doc.id, doc.pending_rate_request)}
                                  className="px-2 py-1 rounded bg-indigo-50 text-indigo-600 hover:bg-indigo-100 font-bold text-xs transition-colors"
                                >
                                  Approve Rate
                                </button>
                                <button 
                                  onClick={() => handleRejectRate(doc.id)}
                                  className="px-2 py-1 rounded bg-rose-50 text-rose-600 hover:bg-rose-100 font-bold text-xs transition-colors"
                                >
                                  Reject Rate
                                </button>
                              </div>
                            )}
                            {!doc.verified ? (
                            <button 
                              onClick={() => handleUpdateDoctorStatus(doc.id, { verified: true })}
                              className="px-3 py-1.5 rounded-lg bg-emerald-50 text-emerald-600 hover:bg-emerald-100 font-bold text-xs transition-colors"
                            >
                              Approve
                            </button>
                          ) : (
                            <button 
                              onClick={() => handleUpdateDoctorStatus(doc.id, { verified: false })}
                              className="px-3 py-1.5 rounded-lg bg-slate-100 text-slate-600 hover:bg-slate-200 font-bold text-xs transition-colors"
                            >
                              Revoke
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* OWNERS TAB */}
      {activeTab === 'owners' && (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl font-black text-slate-900">Pet Owners</h1>
              <p className="text-slate-500 font-medium mt-1">Manage pet owners and view their pets.</p>
            </div>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input
                type="text"
                placeholder="Search owners..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 pr-4 py-2 border border-slate-200 rounded-xl w-full sm:w-64 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
              />
            </div>
          </div>

          <div className="bg-white rounded-3xl border border-slate-200 shadow-[0_8px_30px_rgb(0,0,0,0.04)] overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm border-collapse">
                <thead className="bg-slate-50/80 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider text-xs">
                  <tr>
                    <th className="px-6 py-5">Owner Profile</th>
                    <th className="px-6 py-5">Wallet Balance</th>
                    <th className="px-6 py-5">Pets Registered</th>
                    <th className="px-6 py-5">Joined</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredOwners.map(owner => {
                    const ownerWallet = wallets.find(w => w.user_id === owner.id);
                    const ownerPets = pets.filter(p => p.owner_id === owner.id);
                    
                    return (
                      <tr key={owner.id} className="hover:bg-slate-50/50 transition-colors">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center shrink-0 border border-slate-200 overflow-hidden">
                              {owner.profile_image_url ? (
                                <img src={owner.profile_image_url} alt="" className="w-full h-full object-cover" />
                              ) : (
                                <span className="text-slate-500 font-bold">{owner.name ? owner.name.charAt(0) : '?'}</span>
                              )}
                            </div>
                            <div>
                              <p className="font-bold text-slate-900">{owner.name || 'Unknown Owner'}</p>
                              <p className="text-slate-500 text-xs">{owner.email || owner.id.substring(0,8)}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 font-bold text-slate-900">
                          ₹{ownerWallet ? ownerWallet.balance : 0}
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex flex-col gap-1">
                            {ownerPets.length > 0 ? ownerPets.map(p => (
                              <span key={p.id} className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-indigo-50 text-indigo-700">
                                {p.name} ({p.species})
                              </span>
                            )) : (
                              <span className="text-slate-400 text-xs italic">No pets</span>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 text-slate-500 text-xs">
                          {new Date(owner.created_at).toLocaleDateString()}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
