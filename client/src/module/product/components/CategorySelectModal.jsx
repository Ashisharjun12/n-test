import { useState, useEffect, useRef } from "react";
import { Search, Plus, Loader2 } from "lucide-react";
import { categoryApi } from "../../../api/category.api";
import useCompanyStore from "../../../store/company.store";
import BottomSheetModal, { BottomSheetSaveButton } from "../../../components/ui/bottom-sheet-modal";

export default function CategorySelectModal({ title = "Select Category", onClose, onSelect }) {
  const [categories, setCategories] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [addOpen, setAddOpen] = useState(false);
  const [addLoading, setAddLoading] = useState(false);
  const nameInputRef = useRef(null);
  const descInputRef = useRef(null);

  const companyId = useCompanyStore((state) => state.activeCompany?._id);

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

  useEffect(() => {
    if (!addOpen) return undefined;
    const timer = setTimeout(() => {
      if (nameInputRef.current) {
        nameInputRef.current.value = search.trim();
        if (descInputRef.current) descInputRef.current.value = "";
        nameInputRef.current.focus({ preventScroll: true });
      }
    }, 140);
    return () => clearTimeout(timer);
  }, [addOpen]); // eslint-disable-line react-hooks/exhaustive-deps

  const filteredCategories = categories.filter((c) =>
    c.name.toLowerCase().includes(search.toLowerCase())
  );

  const handleAdd = async () => {
    const name = (nameInputRef.current?.value || "").trim();
    const description = (descInputRef.current?.value || "").trim();
    if (!name || !companyId) {
      alert("Please enter a category name.");
      return;
    }

    setAddLoading(true);
    try {
      const res = await categoryApi.createCategory({
        name,
        description: description || undefined,
        companyId,
      });
      setCategories((prev) => [...prev, res.data]);
      setAddOpen(false);
      onSelect(res.data);
    } catch (err) {
      console.error(err);
      alert(err.message || "Failed to create category");
    } finally {
      setAddLoading(false);
    }
  };

  const handleClose = () => {
    if (addOpen) {
      setAddOpen(false);
      return;
    }
    onClose();
  };

  return (
    <BottomSheetModal
      open
      title={addOpen ? "Add New Category" : title}
      onClose={handleClose}
      size={addOpen ? "default" : "tall"}
      maxWidth="max-w-lg"
      bodyClassName={
        addOpen ? "" : "flex flex-col min-h-0 p-0 !py-0 bg-white overflow-hidden"
      }
      footer={
        addOpen ? (
          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => setAddOpen(false)}
              className="flex-1 rounded-[100px] text-[15px] font-semibold text-[#0a0b0d] transition-all bg-[#eef0f3] hover:bg-[#dee1e6] h-12 cursor-pointer"
            >
              Cancel
            </button>
            <BottomSheetSaveButton
              label="Save Category"
              loading={addLoading}
              onClick={handleAdd}
              className="flex-1 h-12"
            />
          </div>
        ) : (
          <button
            type="button"
            onClick={() => setAddOpen(true)}
            className="w-full flex items-center justify-center gap-2 rounded-[100px] text-[15px] font-semibold text-[#0052ff] transition-all bg-transparent hover:bg-[#f0f4ff] h-12 cursor-pointer"
          >
            <Plus className="size-4" /> Add New Category
          </button>
        )
      }
    >
      {addOpen ? (
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label htmlFor="cat-name" className="text-[13px] font-semibold text-[#0a0b0d] px-1">
              Category Name *
            </label>
            <input
              ref={nameInputRef}
              id="cat-name"
              type="text"
              placeholder="e.g. Electronics"
              autoComplete="off"
              spellCheck={false}
              className="w-full h-[48px] rounded-[12px] text-[14px] outline-none px-4 border border-[#0052ff] bg-white text-[#0a0b0d]"
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label htmlFor="cat-desc" className="text-[13px] font-semibold text-[#0a0b0d] px-1">
              Description <span className="text-[#a8acb3] font-normal">(optional)</span>
            </label>
            <textarea
              ref={descInputRef}
              id="cat-desc"
              placeholder="Brief description of this category"
              autoComplete="off"
              spellCheck={false}
              rows={3}
              className="w-full rounded-[12px] text-[14px] outline-none px-4 py-3 border border-[#dee1e6] bg-white text-[#0a0b0d] resize-none focus:border-[#0052ff] transition-colors"
            />
          </div>
        </div>
      ) : (
        <>
          <div className="p-4 shrink-0 bg-white border-b border-[#dee1e6]">
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

          <div className="flex-1 min-h-0 overflow-y-auto overscroll-y-contain p-4 flex flex-col gap-2 bg-[#f7f7f7]">
            {loading ? (
              <div className="flex flex-col items-center justify-center py-10 gap-2">
                <Loader2 className="size-6 animate-spin text-[#0052ff]" />
                <p className="text-[13px] text-[#7c828a] font-medium">Loading categories...</p>
              </div>
            ) : filteredCategories.length > 0 ? (
              <div className="flex flex-col px-1">
                {filteredCategories.map((cat) => (
                  <button
                    key={cat._id}
                    type="button"
                    onClick={() => onSelect(cat)}
                    className="w-full flex flex-col py-3 bg-transparent cursor-pointer transition-all text-left hover:text-[#0052ff] group"
                  >
                    <span className="text-[15px] font-medium text-[#0a0b0d] group-hover:text-[#0052ff] transition-colors">
                      {cat.name}
                    </span>
                    {cat.description && (
                      <span className="text-[12px] text-[#7c828a] mt-0.5 line-clamp-1">
                        {cat.description}
                      </span>
                    )}
                  </button>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-10 text-center px-4">
                <div className="size-12 rounded-full bg-[#eef0f3] flex items-center justify-center mb-3">
                  <Search className="size-6 text-[#a8acb3]" />
                </div>
                <p className="text-[14px] font-semibold text-[#0a0b0d] mb-1">No categories found</p>
                <p className="text-[13px] text-[#7c828a] mb-4">
                  Try a different search term or add a new category.
                </p>
                <button
                  type="button"
                  onClick={() => setAddOpen(true)}
                  className="text-[14px] font-semibold text-[#0052ff] cursor-pointer hover:underline"
                >
                  Add New Category
                </button>
              </div>
            )}
          </div>
        </>
      )}
    </BottomSheetModal>
  );
}
