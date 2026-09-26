import React, { useState } from 'react';
import { Layers, Plus, Edit2, Trash2, X, Check, AlertCircle, Sparkles } from 'lucide-react';
import { useData } from '../context/DataContext';
import { CategoryItem, Language } from '../types';
import { adminTranslations } from '../data/adminTranslations';

interface CategoryManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentLang?: Language;
}

export const CategoryManagerModal: React.FC<CategoryManagerModalProps> = ({ 
  isOpen, 
  onClose,
  currentLang = 'az'
}) => {
  const t = adminTranslations[currentLang]?.categoryModal || adminTranslations.az.categoryModal;
  const { categories, products, addCategory, updateCategory, deleteCategory } = useData();

  const [isAddingNew, setIsAddingNew] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Form fields
  const [idInput, setIdInput] = useState('');
  const [nameAz, setNameAz] = useState('');
  const [nameEn, setNameEn] = useState('');
  const [nameRu, setNameRu] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  if (!isOpen) return null;

  const resetForm = () => {
    setIdInput('');
    setNameAz('');
    setNameEn('');
    setNameRu('');
    setErrorMessage('');
    setEditingId(null);
    setIsAddingNew(false);
  };

  const startEdit = (cat: CategoryItem) => {
    setEditingId(cat.id);
    setIdInput(cat.id);
    setNameAz(cat.nameAz);
    setNameEn(cat.nameEn || '');
    setNameRu(cat.nameRu || '');
    setIsAddingNew(false);
    setErrorMessage('');
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');

    if (!nameAz.trim()) {
      setErrorMessage(t.nameAzRequired);
      return;
    }

    if (editingId) {
      // Update existing
      const res = await updateCategory(editingId, {
        nameAz: nameAz.trim(),
        nameEn: nameEn.trim() || nameAz.trim(),
        nameRu: nameRu.trim() || nameAz.trim()
      });

      if (res.success) {
        setSuccessMessage(t.saveSuccess);
        resetForm();
        setTimeout(() => setSuccessMessage(''), 2500);
      } else {
        setErrorMessage(res.error || 'Xəta baş verdi.');
      }
    } else {
      // Add new
      const finalId = idInput.trim().toLowerCase().replace(/[^a-z0-9_-]/g, '-') ||
        nameAz.trim().toLowerCase().replace(/[^a-z0-9_-]/g, '-');

      if (!finalId) {
        setErrorMessage(t.idRequired);
        return;
      }

      const res = await addCategory({
        id: finalId,
        nameAz: nameAz.trim(),
        nameEn: nameEn.trim() || nameAz.trim(),
        nameRu: nameRu.trim() || nameAz.trim(),
        order: categories.length + 1
      });

      if (res.success) {
        setSuccessMessage(t.saveSuccess);
        resetForm();
        setTimeout(() => setSuccessMessage(''), 2500);
      } else {
        setErrorMessage(res.error || 'Xəta baş verdi.');
      }
    }
  };

  const handleDelete = async (cat: CategoryItem) => {
    const productCount = products.filter(p => {
      const cats: string[] = Array.isArray(p.categories) && p.categories.length > 0
        ? p.categories
        : [p.category];
      return cats.includes(cat.id);
    }).length;
    let confirmMsg = t.deleteConfirm.replace('{name}', cat.nameAz);
    if (productCount > 0) {
      confirmMsg += `\n\n${t.inUseAlert.replace('{count}', String(productCount))}`;
    }

    if (window.confirm(confirmMsg)) {
      const res = await deleteCategory(cat.id);
      if (res.success) {
        setSuccessMessage(t.deleteSuccess);
        setTimeout(() => setSuccessMessage(''), 2500);
      } else {
        setErrorMessage(res.error || 'Silinərkən xəta.');
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 overflow-hidden">
      <div className="bg-[#12141B] border border-white/10 rounded-2xl max-w-5xl lg:max-w-6xl w-full max-h-[92vh] flex flex-col shadow-2xl overflow-hidden relative animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 bg-[#161822]/80 backdrop-blur-md shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#FFD21A]/10 border border-[#FFD21A]/30 flex items-center justify-center text-[#FFD21A]">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold uppercase tracking-wide text-white">
                {t.modalTitle}
              </h3>
              <p className="text-xs text-gray-400 font-mono">
                {t.modalSubtitle}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-gray-400 hover:text-white hover:bg-white/5 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="flex-1 overflow-y-auto p-6 sm:p-7 space-y-6">

          {/* Alert Messages */}
          {successMessage && (
            <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-mono flex items-center gap-2 animate-in fade-in">
              <Check className="w-4 h-4 shrink-0" />
              <span>{successMessage}</span>
            </div>
          )}

          {errorMessage && (
            <div className="p-3.5 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs font-mono flex items-center gap-2 animate-in fade-in">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Add / Edit Form Drawer (Horizontal 4-Column Inputs) */}
          {(isAddingNew || editingId) && (
            <form onSubmit={handleSave} className="bg-[#0E0F14] border border-[#FFD21A]/40 rounded-2xl p-5 space-y-4 animate-in fade-in zoom-in-95 duration-150 shadow-[0_0_20px_rgba(255,210,26,0.08)]">
              <div className="flex items-center justify-between border-b border-white/10 pb-2.5">
                <span className="text-xs font-bold text-[#FFD21A] uppercase tracking-wider flex items-center gap-2">
                  <Sparkles className="w-4 h-4" />
                  {editingId ? t.editCategory : t.addNewCategory}
                </span>
                <button
                  type="button"
                  onClick={resetForm}
                  className="text-xs font-mono text-gray-400 hover:text-white"
                >
                  {t.cancelBtn}
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div>
                  <label className="block text-[11px] font-mono uppercase text-gray-300 mb-1.5 font-medium">
                    {t.slugKey} <span className="text-[#FFD21A]">*</span>
                  </label>
                  <input
                    type="text"
                    disabled={!!editingId}
                    value={idInput}
                    onChange={(e) => setIdInput(e.target.value)}
                    placeholder={t.slugPlaceholder}
                    className="w-full bg-[#16181F] border border-white/15 rounded-xl px-3.5 py-2.5 text-xs text-white font-mono focus:border-[#FFD21A] focus:outline-none disabled:opacity-50 transition-colors"
                    required
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-mono uppercase text-gray-300 mb-1.5 font-medium">
                    {t.nameAz} <span className="text-[#FFD21A]">*</span>
                  </label>
                  <input
                    type="text"
                    value={nameAz}
                    onChange={(e) => {
                      setNameAz(e.target.value);
                      if (!editingId && !idInput) {
                        setIdInput(e.target.value.toLowerCase().replace(/[^a-z0-9_-]/g, '-'));
                      }
                    }}
                    placeholder="Məs: Ağıllı İdarəetmə"
                    className="w-full bg-[#16181F] border border-white/15 rounded-xl px-3.5 py-2.5 text-xs text-white focus:border-[#FFD21A] focus:outline-none transition-colors"
                    required
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-mono uppercase text-gray-300 mb-1.5 font-medium">
                    {t.nameEn}
                  </label>
                  <input
                    type="text"
                    value={nameEn}
                    onChange={(e) => setNameEn(e.target.value)}
                    placeholder="e.g. Smart Controls"
                    className="w-full bg-[#16181F] border border-white/15 rounded-xl px-3.5 py-2.5 text-xs text-white focus:border-[#FFD21A] focus:outline-none transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-mono uppercase text-gray-300 mb-1.5 font-medium">
                    {t.nameRu}
                  </label>
                  <input
                    type="text"
                    value={nameRu}
                    onChange={(e) => setNameRu(e.target.value)}
                    placeholder="напр: Умное управление"
                    className="w-full bg-[#16181F] border border-white/15 rounded-xl px-3.5 py-2.5 text-xs text-white focus:border-[#FFD21A] focus:outline-none transition-colors"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-2 border-t border-white/5">
                <button
                  type="button"
                  onClick={resetForm}
                  className="px-4 py-2 rounded-xl bg-white/5 text-gray-300 text-xs font-mono hover:bg-white/10 transition-colors"
                >
                  {t.cancelBtn}
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 rounded-xl bg-[#FFD21A] text-black font-bold text-xs uppercase tracking-wider hover:bg-[#F0C413] transition-all shadow-[0_0_15px_rgba(255,210,26,0.3)]"
                >
                  {editingId ? t.saveBtn : t.saveBtn}
                </button>
              </div>
            </form>
          )}

          {/* Action Bar: Add New & Stats */}
          <div className="flex items-center justify-between bg-[#0E0F14] border border-white/10 rounded-2xl px-5 py-3.5">
            <span className="text-xs font-mono text-gray-400">
              {t.existingCategories}: <strong className="text-white text-sm ml-1">{categories.length}</strong>
            </span>
            {!isAddingNew && !editingId && (
              <button
                onClick={() => {
                  resetForm();
                  setIsAddingNew(true);
                }}
                className="flex items-center gap-2 bg-[#FFD21A] text-black font-bold text-xs uppercase tracking-wider px-5 py-2.5 rounded-xl hover:bg-[#F0C413] transition-all shadow-[0_0_15px_rgba(255,210,26,0.25)]"
              >
                <Plus className="w-4 h-4" />
                <span>{t.addNewCategory}</span>
              </button>
            )}
          </div>

          {/* Categories List Table */}
          <div className="border border-white/10 rounded-2xl overflow-hidden bg-[#0E0F14]">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#16181F] text-gray-400 font-mono text-[10px] uppercase border-b border-white/10 sticky top-0">
                <tr>
                  <th className="px-5 py-3.5">Kateqoriya Adı (AZ / EN / RU)</th>
                  <th className="px-5 py-3.5">Slug (ID)</th>
                  <th className="px-5 py-3.5 text-center">Məhsul Sayı</th>
                  <th className="px-5 py-3.5 text-right">Əməliyyatlar</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 text-gray-300">
                {categories.map((cat) => {
                  const productCount = products.filter(p => {
      const cats: string[] = Array.isArray(p.categories) && p.categories.length > 0
        ? p.categories
        : [p.category];
      return cats.includes(cat.id);
    }).length;
                  const displayName = currentLang === 'ru' && cat.nameRu 
                    ? cat.nameRu 
                    : currentLang === 'en' && cat.nameEn 
                    ? cat.nameEn 
                    : cat.nameAz;

                  return (
                    <tr key={cat.id} className="hover:bg-white/5 transition-colors">
                      <td className="px-5 py-3.5">
                        <div className="font-bold text-white text-xs">{displayName}</div>
                        <div className="text-[11px] text-gray-400 font-mono mt-0.5">
                          {cat.nameAz} {cat.nameEn && `• ${cat.nameEn}`} {cat.nameRu && `• ${cat.nameRu}`}
                        </div>
                      </td>
                      <td className="px-5 py-3.5 font-mono text-xs text-[#FFD21A]">
                        {cat.id}
                      </td>
                      <td className="px-5 py-3.5 text-center font-mono">
                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-medium ${
                          productCount > 0
                            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                            : 'bg-white/5 text-gray-400'
                        }`}>
                          {productCount} {t.productsCount}
                        </span>
                      </td>
                      <td className="px-5 py-3.5 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => startEdit(cat)}
                            title={t.editBtn}
                            className="p-2 rounded-xl bg-[#FFD21A]/10 hover:bg-[#FFD21A]/20 text-[#FFD21A] transition-colors"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDelete(cat)}
                            title={t.deleteBtn}
                            className="p-2 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-400 transition-colors"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

        </div>

        {/* Sticky Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-white/10 bg-[#161822]/90 backdrop-blur-md shrink-0">
          <p className="text-[11px] text-gray-400 font-mono">
            💡 {t.modalSubtitle}
          </p>
          <button
            onClick={onClose}
            className="px-6 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 text-white font-bold text-xs uppercase tracking-wider transition-colors"
          >
            {t.closeBtn}
          </button>
        </div>

      </div>
    </div>
  );
};

