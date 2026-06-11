import { useState, useEffect } from "react";
import { X, Search, Plus, Loader2 } from "lucide-react";
import { categoryApi } from "../../../api/category.api";
import useCompanyStore from "../../../store/company.store";

export default function CategorySelectModal({ title = "Select Category", onClose, onSelect }) {
  const [categories, setCategories] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [addLoading, setAddLoading] = useState(false);
  
  const companyId = useCompanyStore(state => state.activeCompany?._id);

  useEffect(() => {
    const fetchCats = async () => {
      if (!companyId) return;
      setLoading(true);
      try {
        const res = await categoryApi.getCategories(companyId);
        setCategories(res.data || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchCats();
  }, [companyId]);

  const filteredCategories = categories.filter(c => c.name.toLowerCase().includes(search.toLowerCase()));

  const handleAdd = async () => {
    if (!newCategoryName.trim() || !companyId) return;
    setAddLoading(true);
    try {
      const res = await categoryApi.createCategory({ name: newCategoryName, companyId });
      setCategories([...categories, res.data]);
      setIsAdding(false);
      setNewCategoryName("");
      onSelect(res.data);
    } catch (err) {
      console.error(err);
      alert("Failed to create category");
    } finally {
      setAddLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[60] flex flex-col bg-[#f7f7f7] animate-in slide-in-from-bottom duration-300">
      <div className="flex items-center justify-between px-5 pt-4 pb-3 shrink-0 bg-white" style={{ borderBottom: "1px solid #dee1e6" }}>
        <h2 className="text-[18px] font-bold text-[#0a0b0d]">
          {isAdding ? "Add New Category" : title}
        </h2>
        <button onClick={onClose} className="cursor-pointer transition-colors text-[#5b616e] hover:text-[#0a0b0d]">
          <X className="size-6" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto flex flex-col">
        {isAdding ? (
          <div className="p-5 flex flex-col gap-6">
            <div>
              <div className="relative w-full">
                <input
                  type="text"
                  placeholder="Category Name"
                  value={newCategoryName}
                  onChange={(e) => setNewCategoryName(e.target.value)}
                  className="w-full h-[48px] rounded-[12px] text-[14px] outline-none transition-all px-4 bg-[#eef0f3] text-[#0a0b0d]"
                />
              </div>
              <p className="text-[12px] text-[#7c828a] mt-2 px-1">Enter a name for the new category.</p>
            </div>
          </div>
        ) : (
          <>
            <div className="p-4 shrink-0 bg-white" style={{ borderBottom: "1px solid #dee1e6" }}>
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 size-4 text-[#5b616e]" />
                <input 
                  type="text"
                  placeholder="Search categories..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full h-[44px] pl-10 pr-4 rounded-[12px] bg-[#eef0f3] outline-none text-[14px] text-[#0a0b0d] transition-colors"
                />
              </div>
            </div>
            
            <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-2">
              {loading ? (
                <div className="flex flex-col items-center justify-center py-10 gap-2">
                  <Loader2 className="size-6 animate-spin text-[#0052ff]" />
                  <p className="text-[13px] text-[#7c828a] font-medium">Loading categories...</p>
                </div>
              ) : filteredCategories.length > 0 ? (
                <div className="flex flex-col px-1">
                  {filteredCategories.map(cat => (
                    <div key={cat._id}>
                      <button 
                        onClick={() => onSelect(cat)}
                        className="w-full flex items-center justify-between py-3 bg-transparent cursor-pointer transition-all text-left hover:text-[#0052ff] group"
                      >
                        <span className="text-[15px] font-medium text-[#0a0b0d] group-hover:text-[#0052ff] transition-colors">{cat.name}</span>
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-10 text-center px-4">
                  <div className="size-12 rounded-full bg-[#eef0f3] flex items-center justify-center mb-3">
                    <Search className="size-6 text-[#a8acb3]" />
                  </div>
                  <p className="text-[14px] font-semibold text-[#0a0b0d] mb-1">No categories found</p>
                  <p className="text-[13px] text-[#7c828a] mb-4">Try a different search term or add a new category.</p>
                </div>
              )}
            </div>
          </>
        )}
      </div>

      <div className="px-5 pb-6 pt-3 shrink-0 bg-white border-t border-[#dee1e6]">
        {isAdding ? (
          <div className="flex gap-3">
            <button 
              onClick={() => { setIsAdding(false); setNewCategoryName(""); }}
              className="flex-1 rounded-[100px] text-[15px] font-semibold text-[#0a0b0d] transition-all bg-[#eef0f3] hover:bg-[#dee1e6] h-12"
            >
              Cancel
            </button>
            <button 
              onClick={handleAdd}
              disabled={!newCategoryName.trim() || addLoading}
              className="flex-1 rounded-[100px] flex items-center justify-center gap-2 text-[15px] font-semibold text-white transition-all bg-[#0052ff] hover:bg-[#003ecc] h-12 disabled:opacity-50"
            >
              {addLoading && <Loader2 className="size-4 animate-spin" />}
              Save Category
            </button>
          </div>
        ) : (
          <button 
            onClick={() => setIsAdding(true)}
            className="w-full flex items-center justify-center gap-2 rounded-[100px] text-[15px] font-semibold text-[#0052ff] transition-all bg-transparent hover:bg-[#f0f4ff] h-12"
          >
            <Plus className="size-4" /> Add New Category
          </button>
        )}
      </div>
    </div>
  );
}
