import React, { useState, useEffect, useCallback } from "react";
import { supabase } from "../supabaseClient";
import { ethers } from "ethers";
import "./Certificates.css";

const CONTRACT_ADDRESS = "0x148F3DE706889E46ED4555Ec522E9a10C2af3dd7";
const CONTRACT_ABI = ["function batchSyncPWD(string[] _uuids, string[] _names, string[] _benIds, string[] _urls) public"];

const Certificates = () => {
  const [dataList, setDataList] = useState([]);
  const [selectedIds, setSelectedIds] = useState([]);
  const [isBatchSyncing, setIsBatchSyncing] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const fetchCombinedData = useCallback(async () => {
    try {
      // We fetch from tbl_pwd and join tbl_certificates 
      // so even those without certificates (newly approved) show up
      const { data, error } = await supabase
        .from("tbl_pwd")
        .select(`
          id,
          firstname,
          lastname,
          status,
          created_at,
          tbl_certificates (
            id,
            certificate_url,
            is_synced
          )
        `)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setDataList(data || []);
    } catch (error) {
      console.error("Error loading tracking data:", error);
    }
  }, []);

  useEffect(() => {
    fetchCombinedData();
  }, [fetchCombinedData]);

  const handleBatchSync = async () => {
    const toSync = dataList.filter(item => 
      selectedIds.includes(item.id) && item.tbl_certificates?.[0]?.certificate_url
    );

    if (toSync.length === 0) return alert("Select approved records with uploaded certificates to sync.");

    try {
      setIsBatchSyncing(true);
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);

      const tx = await contract.batchSyncPWD(
        toSync.map(r => r.tbl_certificates[0].id.toString()),
        toSync.map(r => `${r.firstname} ${r.lastname}`),
        toSync.map(r => r.id.toString()),
        toSync.map(r => r.tbl_certificates[0].certificate_url)
      );
      
      await tx.wait();

      const certIds = toSync.map(r => r.tbl_certificates[0].id);
      await supabase.from("tbl_certificates").update({ is_synced: true }).in("id", certIds);
      
      alert("Blockchain Sync Complete!");
      setSelectedIds([]);
      fetchCombinedData();
    } catch (err) {
      alert("Sync Failed: " + err.message);
    } finally {
      setIsBatchSyncing(false);
    }
  };

  const filteredData = dataList.filter(item => 
    `${item.firstname} ${item.lastname}`.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="certificates-wrapper">
      <header className="page-header">
        <h2 className="page-title">Issuance & Blockchain Tracking</h2>
        <div className="search-bar">
          <input 
            type="text" 
            placeholder="Search beneficiary..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </header>

      <div className="list-card">
        <div className="list-header" style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
          <h3>Registration Status</h3>
          <button 
            className="btn-submit" 
            onClick={handleBatchSync}
            disabled={selectedIds.length === 0 || isBatchSyncing}
          >
            {isBatchSyncing ? "Processing..." : `Sync Blockchain (${selectedIds.length})`}
          </button>
        </div>

        <div className="table-responsive">
          <table className="cert-table">
            <thead>
              <tr>
                <th>Select</th>
                <th>Full Name</th>
                <th>App Status</th>
                <th>File Status</th>
                <th>Blockchain</th>
              </tr>
            </thead>
            <tbody>
              {filteredData.map((item) => {
                const cert = item.tbl_certificates?.[0];
                return (
                  <tr key={item.id}>
                    <td>
                      <input 
                        type="checkbox"
                        disabled={!cert || cert.is_synced || item.status !== 'Approved'}
                        checked={selectedIds.includes(item.id)}
                        onChange={() => setSelectedIds(prev => prev.includes(item.id) ? prev.filter(i => i !== item.id) : [...prev, item.id])}
                      />
                    </td>
                    <td className="bold">{item.firstname} {item.lastname}</td>
                    <td>
                      <span className={`status-pill ${item.status?.toLowerCase()}`}>
                        {item.status || "Pending"}
                      </span>
                    </td>
                    <td>
                      {cert ? (
                        <a href={cert.certificate_url} target="_blank" rel="noreferrer" className="view-link">View Doc</a>
                      ) : (
                        <span className="sub-text" style={{ color: '#ef4444' }}>No File Uploaded</span>
                      )}
                    </td>
                    <td>
                      <span className={`status-badge ${cert?.is_synced ? "synced" : "pending"}`}>
                        {cert?.is_synced ? "Synced" : "Not Secured"}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Certificates;