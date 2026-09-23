import { useState, useEffect } from 'react';
import {
  FiSearch, FiPlus, FiEdit2, FiTrash2, FiX, FiPackage,
  FiCheck, FiLoader, FiAlertCircle, FiChevronLeft, FiChevronRight,
  FiLayers, FiChevronRight as FiArrowRight
} from 'react-icons/fi';
import {
  useProducts, useProduct, useCreateProduct, useUpdateProduct, useDeleteProduct,
  useCategories, useCreateCategory, useUpdateCategory, useDeleteCategory,
  useLowStockProducts
} from '../hooks/useProducts';

const inputClass = "w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl text-sm font-medium text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#1447E6]/20 focus:border-[#1447E6] transition-all";

const ProductForm = ({ formData, setFormData, categories, onSubmit, submitLabel, isPending }) => {
  const isUzs = formData.currency === 'uzs';
  const hasPrice = parseFloat(formData.sale_price || 0) > 0;
  const symbol = isUzs ? "so'm" : '$';
  const symbolClass = isUzs ? 'text-[#1447E6]' : 'text-emerald-600';

  return (
    <div className="p-4 space-y-4">
      <div>
        <label className="block text-xs font-semibold text-gray-500 mb-1.5">Mahsulot nomi</label>
        <input type="text" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} className={inputClass} placeholder="Mahsulot nomini kiriting" />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-semibold text-gray-500 mb-1.5">Kategoriya</label>
          <select value={formData.category} onChange={(e) => setFormData({ ...formData, category: e.target.value })} className={inputClass}>
            <option value="">Tanlang...</option>
            {categories.map(cat => <option key={cat.id} value={cat.id}>{cat.name}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-xs font-semibold text-gray-500 mb-1.5">Birlik</label>
          <select value={formData.unit} onChange={(e) => setFormData({ ...formData, unit: e.target.value })} className={inputClass}>
            <option value="dona">Dona</option>
            <option value="kg">Kg</option>
            <option value="litr">Litr</option>
            <option value="metr">Metr</option>
          </select>
        </div>
      </div>

      <div>
        <label className="block text-xs font-semibold text-gray-500 mb-1.5">Miqdor</label>
        <input type="number" value={formData.quantity} onChange={(e) => setFormData({ ...formData, quantity: e.target.value })} className={inputClass} placeholder="0" />
      </div>

      <div>
        <label className="block text-xs font-semibold text-gray-500 mb-2">Valyuta</label>
        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={() => setFormData({ ...formData, currency: 'usd', sale_price: '', cost_price: '' })}
            className={`py-2.5 rounded-xl font-bold text-sm transition-all ${!isUzs ? 'bg-emerald-500 text-white shadow-sm' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'}`}
          >
            $ (USD)
          </button>
          <button
            type="button"
            onClick={() => setFormData({ ...formData, currency: 'uzs', sale_price: '', cost_price: '' })}
            className={`py-2.5 rounded-xl font-bold text-sm transition-all ${isUzs ? 'bg-[#1447E6] text-white shadow-sm' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'}`}
          >
            so'm (UZS)
          </button>
        </div>
      </div>

      <div>
        <label className="block text-xs font-semibold text-gray-500 mb-1.5">Tan narx</label>
        <div className="relative">
          <span className={`absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold ${symbolClass}`}>{symbol}</span>
          <input
            type="number"
            value={formData.cost_price}
            onChange={(e) => setFormData({ ...formData, cost_price: e.target.value })}
            className={inputClass + (isUzs ? ' pl-12' : ' pl-7')}
            placeholder="0"
          />
        </div>
      </div>

      <div>
        <label className="block text-xs font-semibold text-gray-500 mb-1.5">Sotuv narxi</label>
        <div className="relative">
          <span className={`absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold ${symbolClass}`}>{symbol}</span>
          <input
            type="number"
            value={formData.sale_price}
            onChange={(e) => setFormData({ ...formData, sale_price: e.target.value })}
            className={inputClass + (isUzs ? ' pl-12' : ' pl-7')}
            placeholder="0"
          />
        </div>
      </div>

      <div className="flex gap-3 pt-2">
        <button onClick={onSubmit} disabled={isPending || !formData.name || !hasPrice} className="flex-1 px-4 py-3.5 bg-[#1447E6] text-white rounded-2xl font-bold hover:bg-blue-700 disabled:opacity-50 flex items-center justify-center gap-2">
          {isPending && <FiLoader className="animate-spin w-4 h-4" />}
          {submitLabel}
        </button>
      </div>
    </div>
  );
};

const statusConfig = {
  good: { label: 'Yaxshi', bg: 'bg-emerald-50', text: 'text-emerald-700', dot: 'bg-emerald-500' },
  low: { label: 'Kam', bg: 'bg-amber-50', text: 'text-amber-700', dot: 'bg-amber-400' },
  critical: { label: 'Tanqis', bg: 'bg-red-50', text: 'text-red-600', dot: 'bg-red-500' },
};

const Warehouse = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(1);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [newCategory, setNewCategory] = useState('');
  const [editingCategory, setEditingCategory] = useState(null);
  const [editValue, setEditValue] = useState('');
  const [showCatDeleteConfirm, setShowCatDeleteConfirm] = useState(false);
  const [categoryToDelete, setCategoryToDelete] = useState(null);
  const [showCategoryStats, setShowCategoryStats] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);

  const [formData, setFormData] = useState({
    name: '',
    category: '',
    quantity: '',
    sale_price: '',
    cost_price: '',
    currency: 'usd',
    unit: 'dona',
  });

  useEffect(() => { setPage(1); }, [searchTerm]);

  const { data: productsData, isLoading: productsLoading } = useProducts({ search: searchTerm, page, ordering: 'quantity' });
  const { data: categoriesData, isLoading: categoriesLoading } = useCategories();
  const { data: lowStockData } = useLowStockProducts();
  const { data: singleProduct, isLoading: productLoading } = useProduct(selectedProduct?.id);

  useEffect(() => {
    if (singleProduct && showEditModal) {
      setFormData({
        name: singleProduct.name || '',
        category: singleProduct.category?.toString() || '',
        quantity: singleProduct.quantity?.toString() || '0',
        sale_price: singleProduct.sale_price || '',
        cost_price: singleProduct.cost_price || '',
        currency: singleProduct.currency || 'uzs',
        unit: singleProduct.unit || 'dona',
      });
    }
  }, [singleProduct, showEditModal]);

  const createProductMutation = useCreateProduct();
  const updateProductMutation = useUpdateProduct();
  const deleteProductMutation = useDeleteProduct();
  const createCategoryMutation = useCreateCategory();
  const updateCategoryMutation = useUpdateCategory();
  const deleteCategoryMutation = useDeleteCategory();

  const products = productsData?.results || [];
  const categories = categoriesData?.results || [];
  const totalProductPages = productsData?.count ? Math.ceil(productsData.count / 20) : 1;

  const totalProductCount = productsData?.count ?? products.length;
  const lowStockRaw = lowStockData?.results || lowStockData || [];
  const lowStockCount = Array.isArray(lowStockRaw) ? lowStockRaw.length : 0;

  const categoryStats = categories.map((c) => ({
    id: c.id,
    name: c.name,
    count: c.product_count ?? 0,
    quantity: parseInt(c.total_quantity) || 0,
    saleUzs: parseFloat(c.total_sale_price_uzs) || 0,
    saleUsd: parseFloat(c.total_sale_price_usd) || 0,
    costUzs: parseFloat(c.total_cost_price_uzs) || 0,
    costUsd: parseFloat(c.total_cost_price_usd) || 0,
    lowStock: 0,
  })).sort((a, b) => a.quantity - b.quantity);

  const categoryTotals = categoryStats.reduce((acc, c) => {
    acc.qty += c.quantity;
    acc.saleUzs += c.saleUzs; acc.saleUsd += c.saleUsd;
    acc.costUzs += c.costUzs; acc.costUsd += c.costUsd;
    return acc;
  }, { qty: 0, saleUzs: 0, saleUsd: 0, costUzs: 0, costUsd: 0 });

  // Drill-down: tanlangan kategoriyaning mahsulotlari
  const { data: catProductsData, isLoading: catProductsLoading } = useProducts(
    selectedCategory ? { category: selectedCategory.id, ordering: 'quantity' } : {}
  );

  // Jamlarni to'g'ridan-to'g'ri kategoriya API ma'lumotlaridan olish (barcha mahsulotlar bo'yicha)
  const currentCategoryData = categories.find(c => c.id === selectedCategory?.id) || selectedCategory;
  const catSaleUzs = parseFloat(currentCategoryData?.total_sale_price_uzs ?? currentCategoryData?.saleUzs) || 0;
  const catSaleUsd = parseFloat(currentCategoryData?.total_sale_price_usd ?? currentCategoryData?.saleUsd) || 0;
  const catCostUzs = parseFloat(currentCategoryData?.total_cost_price_uzs ?? currentCategoryData?.costUzs) || 0;
  const catCostUsd = parseFloat(currentCategoryData?.total_cost_price_usd ?? currentCategoryData?.costUsd) || 0;

  const getStatusCfg = (status) => statusConfig[status] || statusConfig.good;

  const buildProductPayload = () => {
    const payload = {
      name: formData.name,
      category: formData.category ? parseInt(formData.category) : null,
      quantity: parseInt(formData.quantity) || 0,
      sale_price: formData.sale_price || '0',
      currency: formData.currency,
      unit: formData.unit,
    };
    if (parseFloat(formData.cost_price) > 0) {
      payload.cost_price = formData.cost_price;
    }
    return payload;
  };

  const handleAddProduct = async () => {
    try {
      await createProductMutation.mutateAsync(buildProductPayload());
      setShowAddModal(false);
      resetForm();
    } catch (error) {}
  };

  const handleEditProduct = async () => {
    try {
      await updateProductMutation.mutateAsync({ id: selectedProduct.id, data: buildProductPayload() });
      setShowEditModal(false);
      resetForm();
    } catch (error) {}
  };

  const handleDeleteProduct = async () => {
    try {
      await deleteProductMutation.mutateAsync(selectedProduct.id);
      setShowDeleteModal(false);
      setSelectedProduct(null);
    } catch (error) {}
  };

  const openEditModal = (product) => {
    setSelectedProduct(product);
    setFormData({
      name: product.name || '',
      category: product.category?.toString() || '',
      quantity: product.quantity?.toString() || '0',
      sale_price: product.sale_price || '',
      cost_price: product.cost_price || '',
      currency: product.currency || 'uzs',
      unit: product.unit || 'dona',
    });
    setShowEditModal(true);
  };

  const openDeleteModal = (product) => {
    setSelectedProduct(product);
    setShowDeleteModal(true);
  };

  const resetForm = () => {
    setFormData({ name: '', category: '', quantity: '', sale_price: '', cost_price: '', currency: 'uzs', unit: 'dona' });
    setSelectedProduct(null);
  };

  const handleAddCategory = async () => {
    if (newCategory) {
      try {
        await createCategoryMutation.mutateAsync({ name: newCategory });
        setNewCategory('');
      } catch (error) {}
    }
  };

  const handleDeleteCategory = (cat) => {
    setCategoryToDelete(cat);
    setShowCatDeleteConfirm(true);
  };

  const confirmDeleteCategory = async () => {
    try {
      await deleteCategoryMutation.mutateAsync(categoryToDelete.id);
      setShowCatDeleteConfirm(false);
      setCategoryToDelete(null);
    } catch (error) {}
  };

  const handleStartEdit = (cat) => {
    setEditingCategory(cat);
    setEditValue(cat.name);
  };

  const handleUpdateCategory = async () => {
    if (editValue && editValue !== editingCategory.name) {
      try {
        await updateCategoryMutation.mutateAsync({ id: editingCategory.id, data: { name: editValue } });
        setEditingCategory(null);
      } catch (error) {}
    } else {
      setEditingCategory(null);
    }
  };

  return (
    <div className="min-h-screen bg-[#F0F4FF] pb-32 md:pb-8">
      {/* White header */}
      <div className="bg-white border-b border-gray-100 shadow-sm">
        <div className="px-5 md:px-8 py-5 max-w-6xl mx-auto">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-xl font-bold text-gray-900">Ombor</h1>
              <p className="text-xs text-gray-400 mt-0.5">Mahsulotlar va zaxiralar</p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowCategoryModal(true)}
                className="px-3 py-5 bg-gray-100 text-gray-700 rounded-xl text-xs font-semibold hover:bg-gray-200 transition-colors"
              >
                Kategoriyalar
              </button>
              <button
                onClick={() => setShowAddModal(true)}
                className="px-3 py-5 bg-[#1447E6] text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm"
              >
                <FiPlus className="w-3.5 h-3.5" />
                Qo'shish
              </button>
            </div>
          </div>

          {/* Stats bar */}
          <div className="grid grid-cols-2 gap-3 mb-3">
            <div className="bg-blue-50 rounded-2xl p-3 border border-blue-100">
              <p className="text-[10px] font-bold text-blue-500 uppercase tracking-wider mb-1">Jami mahsulotlar</p>
              <p className="text-xl font-black text-blue-700">{totalProductCount}</p>
            </div>
            <div className={`rounded-2xl p-3 border ${lowStockCount > 0 ? 'bg-red-50 border-red-100' : 'bg-emerald-50 border-emerald-100'}`}>
              <p className={`text-[10px] font-bold uppercase tracking-wider mb-1 ${lowStockCount > 0 ? 'text-red-500' : 'text-emerald-500'}`}>Kam qolgan</p>
              <p className={`text-xl font-black ${lowStockCount > 0 ? 'text-red-600' : 'text-emerald-600'}`}>{lowStockCount}</p>
            </div>
          </div>

          {/* Category stats button */}
          <button
            onClick={() => setShowCategoryStats(true)}
            className="w-full mb-4 flex items-center gap-3 bg-gradient-to-r from-[#1447E6] to-[#0F3CC7] text-white rounded-2xl px-4 py-3 shadow-sm hover:shadow-md active:scale-[0.99] transition-all"
          >
            <div className="w-9 h-9 bg-white/15 rounded-xl flex items-center justify-center shrink-0">
              <FiLayers className="w-4 h-4" />
            </div>
            <div className="flex-1 text-left">
              <p className="text-sm font-bold leading-tight">Kategoriyalar bo'yicha</p>
              <p className="text-[11px] text-blue-200">{categoryStats.length} ta kategoriya • {categoryTotals.qty.toLocaleString()} dona qoldiq</p>
            </div>
            <FiArrowRight className="w-4 h-4 text-blue-200 shrink-0" />
          </button>

          {/* Search */}
          <div className="relative">
            <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Mahsulotlarni qidirish..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-11 pr-4 py-3 bg-gray-50 rounded-2xl text-sm border border-gray-100 focus:ring-2 focus:ring-[#1447E6]/20 focus:border-[#1447E6] outline-none"
            />
          </div>
        </div>
      </div>

      {/* Product Grid */}
      <div className="px-4 md:px-8 py-4 max-w-6xl mx-auto">
        {productsLoading ? (
          <div className="flex items-center justify-center py-20">
            <FiLoader className="w-8 h-8 text-[#1447E6] animate-spin" />
          </div>
        ) : products.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 bg-white rounded-2xl border border-gray-100 shadow-sm">
            <div className="w-16 h-16 bg-gray-50 rounded-2xl flex items-center justify-center mb-4">
              <FiPackage className="w-8 h-8 text-gray-300" />
            </div>
            <h3 className="text-base font-bold text-gray-900 mb-1">Mahsulot topilmadi</h3>
            <p className="text-gray-400 text-sm text-center max-w-[220px]">
              {searchTerm ? `"${searchTerm}" bo'yicha topilmadi` : 'Hali mahsulot qo\'shilmagan'}
            </p>
            {!searchTerm && (
              <button
                onClick={() => setShowAddModal(true)}
                className="mt-5 px-6 py-3 bg-[#1447E6] text-white rounded-2xl font-bold flex items-center gap-2 shadow-sm text-sm"
              >
                <FiPlus className="w-4 h-4" /> Mahsulot qo'shish
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2.5">
            {products.map((product) => {
              const sc = getStatusCfg(product.status);
              const saleUzs = parseFloat(product.sale_price_uzs || (product.currency === 'uzs' ? product.sale_price : '') || 0);
              const saleUsd = parseFloat(product.sale_price_usd || (product.currency === 'usd' ? product.sale_price : '') || 0);
              return (
                <div
                  key={product.id}
                  className="bg-white rounded-2xl shadow-sm border border-gray-100 px-4 py-3.5 flex flex-col gap-2.5"
                >
                  {/* Top row: status dot + name + actions */}
                  <div className="flex items-start gap-2.5">
                    <div className={`w-2.5 h-2.5 rounded-full shrink-0 mt-1.5 ${sc.dot}`} />
                    <h3 className="text-sm font-bold text-gray-900 flex-1 leading-snug">{product.name}</h3>
                    <div className="flex gap-1.5 shrink-0">
                      <button
                        onClick={() => openEditModal(product)}
                        className="w-8 h-8 bg-blue-50 text-[#1447E6] rounded-xl flex items-center justify-center hover:bg-[#1447E6] hover:text-white transition-all"
                      >
                        <FiEdit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => openDeleteModal(product)}
                        className="w-8 h-8 bg-red-50 text-red-400 rounded-xl flex items-center justify-center hover:bg-red-500 hover:text-white transition-all"
                      >
                        <FiTrash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Bottom row: badges + price + quantity */}
                  <div className="flex items-center gap-2 flex-wrap pl-5">
                    {product.category_name && (
                      <span className="text-[9px] font-semibold text-blue-500 bg-blue-50 px-1.5 py-0.5 rounded-lg">{product.category_name}</span>
                    )}
                    <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-lg ${sc.bg} ${sc.text}`}>{sc.label}</span>

                    <div className="ml-auto flex items-center gap-2">
                      {saleUzs > 0 && (
                        <p className="text-sm font-black text-[#1447E6] leading-tight">
                          {saleUzs.toLocaleString()} so'm
                        </p>
                      )}
                      {saleUsd > 0 && (
                        <p className="text-sm font-black text-emerald-600 leading-tight">
                          ${saleUsd.toLocaleString()}
                        </p>
                      )}
                      <div className="text-center shrink-0 bg-gray-50 rounded-xl px-2.5 py-1">
                        <p className="text-sm font-black text-gray-900 leading-tight">{product.quantity}</p>
                        <p className="text-[9px] text-gray-400">{product.unit || 'dona'}</p>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Pagination */}
        {totalProductPages > 1 && (
          <div className="flex items-center justify-between mt-4 bg-white rounded-2xl px-4 py-3 border border-gray-100 shadow-sm">
            <button
              onClick={() => setPage(p => p - 1)}
              disabled={page === 1 || productsLoading}
              className="flex items-center gap-1.5 px-4 py-2 bg-gray-100 text-gray-600 rounded-xl text-sm font-semibold hover:bg-[#1447E6] hover:text-white transition-all disabled:opacity-30"
            >
              <FiChevronLeft className="w-4 h-4" /> Oldingi
            </button>
            <span className="text-sm font-bold text-gray-600">
              {page} / {totalProductPages}
              <span className="font-normal text-gray-400 ml-1.5">({productsData?.count} ta mahsulot)</span>
            </span>
            <button
              onClick={() => setPage(p => p + 1)}
              disabled={page === totalProductPages || productsLoading}
              className="flex items-center gap-1.5 px-4 py-2 bg-gray-100 text-gray-600 rounded-xl text-sm font-semibold hover:bg-[#1447E6] hover:text-white transition-all disabled:opacity-30"
            >
              Keyingi <FiChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>

      {/* Add Product Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60] flex items-end" onClick={() => { setShowAddModal(false); resetForm(); }}>
          <div className="bg-white rounded-t-3xl w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="sticky top-0 bg-white border-b border-gray-100 px-5 py-4 flex items-center justify-between">
              <h2 className="text-lg font-bold text-gray-900">Mahsulot qo'shish</h2>
              <button onClick={() => { setShowAddModal(false); resetForm(); }} className="w-8 h-8 bg-gray-100 rounded-xl flex items-center justify-center text-gray-500">
                <FiX className="w-4 h-4" />
              </button>
            </div>
            <ProductForm formData={formData} setFormData={setFormData} categories={categories} onSubmit={handleAddProduct} submitLabel="Saqlash" isPending={createProductMutation.isPending} />
          </div>
        </div>
      )}

      {/* Edit Product Modal */}
      {showEditModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60] flex items-end" onClick={() => { setShowEditModal(false); resetForm(); }}>
          <div className="bg-white rounded-t-3xl w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="sticky top-0 bg-white border-b border-gray-100 px-5 py-4 flex items-center justify-between">
              <h2 className="text-lg font-bold text-gray-900">Mahsulotni tahrirlash</h2>
              <button onClick={() => { setShowEditModal(false); resetForm(); }} className="w-8 h-8 bg-gray-100 rounded-xl flex items-center justify-center text-gray-500">
                <FiX className="w-4 h-4" />
              </button>
            </div>
            {productLoading ? (
              <div className="py-16 flex flex-col items-center justify-center text-gray-400">
                <FiLoader className="w-8 h-8 animate-spin mb-3" />
                <p className="text-sm">Ma'lumotlar yuklanmoqda...</p>
              </div>
            ) : (
              <ProductForm formData={formData} setFormData={setFormData} categories={categories} onSubmit={handleEditProduct} submitLabel="Yangilash" isPending={updateProductMutation.isPending} />
            )}
          </div>
        </div>
      )}

      {/* Delete Confirmation */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60] flex items-center justify-center px-4" onClick={() => setShowDeleteModal(false)}>
          <div className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="text-center mb-5">
              <div className="w-12 h-12 bg-red-50 rounded-2xl flex items-center justify-center mx-auto mb-3">
                <FiTrash2 className="w-6 h-6 text-red-500" />
              </div>
              <h3 className="text-base font-bold text-gray-900 mb-1">Mahsulotni o'chirish</h3>
              <p className="text-sm text-gray-500">"{selectedProduct?.name}" mahsulotini o'chirmoqchimisiz?</p>
            </div>
            <div className="flex gap-3">
              <button onClick={() => setShowDeleteModal(false)} className="flex-1 py-3 bg-gray-100 text-gray-700 rounded-xl font-semibold text-sm">
                Bekor
              </button>
              <button
                onClick={handleDeleteProduct}
                disabled={deleteProductMutation.isPending}
                className="flex-1 py-3 bg-red-500 text-white rounded-xl font-bold text-sm flex items-center justify-center gap-2 disabled:opacity-50 hover:bg-red-600"
              >
                {deleteProductMutation.isPending && <FiLoader className="animate-spin w-4 h-4" />}
                O'chirish
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Category Stats Modal */}
      {showCategoryStats && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[70] flex items-end md:items-center md:justify-center" onClick={() => { setShowCategoryStats(false); setSelectedCategory(null); }}>
          <div className="bg-[#F0F4FF] rounded-t-3xl md:rounded-3xl w-full md:max-w-lg max-h-[88vh] overflow-hidden flex flex-col shadow-2xl" onClick={(e) => e.stopPropagation()}>
            {/* Modal header */}
            <div className="bg-gradient-to-br from-[#1447E6] to-[#0F3CC7] px-5 pt-6 pb-5 shrink-0 relative overflow-hidden">
              <div className="absolute -top-6 -right-6 w-24 h-24 bg-white/10 rounded-full" />
              <div className="flex items-center justify-between relative z-10">
                <div className="flex items-center gap-3 min-w-0">
                  {selectedCategory ? (
                    <button
                      onClick={() => setSelectedCategory(null)}
                      className="w-10 h-10 bg-white/15 rounded-2xl flex items-center justify-center text-white hover:bg-white/25 transition-colors shrink-0"
                    >
                      <FiChevronLeft className="w-5 h-5" />
                    </button>
                  ) : (
                    <div className="w-10 h-10 bg-white/15 rounded-2xl flex items-center justify-center shrink-0">
                      <FiLayers className="w-5 h-5 text-white" />
                    </div>
                  )}
                  <div className="min-w-0">
                    <h2 className="text-white text-lg font-bold leading-tight truncate">
                      {selectedCategory ? selectedCategory.name : "Kategoriyalar bo'yicha"}
                    </h2>
                    <p className="text-blue-200 text-xs truncate">
                      {selectedCategory
                        ? `${selectedCategory.count} ta mahsulot • ${selectedCategory.quantity.toLocaleString()} dona`
                        : `${categoryStats.length} ta kategoriya • ${categoryTotals.qty.toLocaleString()} dona`}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => { setShowCategoryStats(false); setSelectedCategory(null); }}
                  className="w-9 h-9 bg-white/15 text-white rounded-xl flex items-center justify-center hover:bg-white/25 transition-colors shrink-0"
                >
                  <FiX className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Modal body */}
            {selectedCategory ? (
              /* ── Drill-down: tanlangan kategoriya mahsulotlari ── */
              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {/* Category value summary */}
                <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <p className="text-[10px] font-bold text-[#1447E6] uppercase tracking-wider mb-1.5">Sotuv summasi</p>
                      {catSaleUsd > 0 && <p className="text-sm font-black text-emerald-600">${catSaleUsd.toLocaleString()}</p>}
                      {catSaleUzs > 0 && <p className="text-sm font-black text-[#1447E6]">{catSaleUzs.toLocaleString()} so'm</p>}
                      {!catSaleUzs && !catSaleUsd && <p className="text-sm font-black text-gray-300">—</p>}
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-orange-500 uppercase tracking-wider mb-1.5">Tan narx summasi</p>
                      {catCostUsd > 0 && <p className="text-sm font-black text-orange-500">${catCostUsd.toLocaleString()}</p>}
                      {catCostUzs > 0 && <p className="text-sm font-black text-orange-600">{catCostUzs.toLocaleString()} so'm</p>}
                      {!catCostUzs && !catCostUsd && <p className="text-sm font-black text-gray-300">—</p>}
                    </div>
                  </div>
                </div>

                {/* Products in category */}
                {catProductsLoading ? (
                  <div className="py-10 flex justify-center"><FiLoader className="w-7 h-7 text-[#1447E6] animate-spin" /></div>
                ) : (catProductsData?.results || []).length === 0 ? (
                  <div className="py-12 text-center text-gray-400">
                    <FiPackage className="w-10 h-10 mx-auto mb-3 opacity-20" />
                    <p className="text-sm">Mahsulot topilmadi</p>
                  </div>
                ) : (catProductsData?.results || []).map((p) => {
                  const sc = getStatusCfg(p.status);
                  const isUsd = (p.currency || 'uzs').toLowerCase() === 'usd';
                  const salePrice = parseFloat(p.sale_price || 0);
                  return (
                    <button
                      key={p.id}
                      onClick={() => { setShowCategoryStats(false); setSelectedCategory(null); openEditModal(p); }}
                      className="w-full bg-white rounded-2xl p-3.5 shadow-sm border border-gray-100 flex items-center gap-3 text-left hover:border-[#1447E6] active:scale-[0.99] transition-all"
                    >
                      <div className={`w-2.5 h-2.5 rounded-full shrink-0 ${sc.dot}`} />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold text-gray-900 truncate">{p.name}</p>
                        <p className={`text-xs font-bold ${isUsd ? 'text-emerald-600' : 'text-[#1447E6]'}`}>
                          {isUsd ? `$${salePrice.toLocaleString()}` : `${salePrice.toLocaleString()} so'm`}
                        </p>
                      </div>
                      <div className="text-center shrink-0 bg-gray-50 rounded-xl px-2.5 py-1">
                        <p className="text-sm font-black text-gray-900 leading-tight">{p.quantity}</p>
                        <p className="text-[9px] text-gray-400">{p.unit || 'dona'}</p>
                      </div>
                      <FiEdit2 className="w-4 h-4 text-gray-300 shrink-0" />
                    </button>
                  );
                })}
              </div>
            ) : (
              /* ── Kategoriyalar ro'yxati + umumiy summa ── */
              <div className="flex-1 overflow-y-auto p-4 space-y-2.5">
                {/* Grand total */}
                <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-3">Jami ombor summasi</p>
                  <div className="space-y-2">
                    {/* Sotuv row */}
                    <div className="flex items-center justify-between">
                      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Sotuv</p>
                      <div className="flex items-center gap-3">
                        {categoryTotals.saleUsd > 0 && <p className="text-base font-black text-emerald-600">${categoryTotals.saleUsd.toLocaleString()}</p>}
                        {categoryTotals.saleUzs > 0 && <p className="text-sm font-bold text-[#1447E6]">{categoryTotals.saleUzs.toLocaleString()} so'm</p>}
                        {!categoryTotals.saleUzs && !categoryTotals.saleUsd && <p className="text-base font-black text-gray-300">—</p>}
                      </div>
                    </div>
                    {/* Tan narx row */}
                    <div className="flex items-center justify-between">
                      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Tan narx</p>
                      <div className="flex items-center gap-3">
                        {categoryTotals.costUsd > 0 && <p className="text-base font-black text-orange-500">${categoryTotals.costUsd.toLocaleString()}</p>}
                        {categoryTotals.costUzs > 0 && <p className="text-sm font-bold text-orange-600">{categoryTotals.costUzs.toLocaleString()} so'm</p>}
                        {!categoryTotals.costUzs && !categoryTotals.costUsd && <p className="text-base font-black text-gray-300">—</p>}
                      </div>
                    </div>
                  </div>
                </div>

                {categoryStats.length === 0 ? (
                  <div className="py-16 text-center text-gray-400">
                    <FiLayers className="w-10 h-10 mx-auto mb-3 opacity-20" />
                    <p className="text-sm">Kategoriya topilmadi</p>
                  </div>
                ) : categoryStats.map((cat) => {
                  const isEmpty = cat.quantity <= 0;
                  return (
                    <button
                      key={cat.name}
                      onClick={() => setSelectedCategory(cat)}
                      className="w-full bg-white rounded-2xl p-4 shadow-sm border border-gray-100 flex items-center gap-3 text-left hover:border-[#1447E6] active:scale-[0.99] transition-all"
                    >
                      <div className={`w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 ${cat.lowStock > 0 || isEmpty ? 'bg-red-50 text-red-500' : 'bg-blue-50 text-[#1447E6]'}`}>
                        <FiPackage className="w-5 h-5" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold text-gray-900 truncate">{cat.name}</p>
                        <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                          <span className="text-[10px] font-semibold text-blue-500 bg-blue-50 px-1.5 py-0.5 rounded-lg">{cat.count} ta</span>
                          {cat.saleUsd > 0 && <span className="text-[10px] font-bold text-emerald-600">${cat.saleUsd.toLocaleString()}</span>}
                          {cat.saleUzs > 0 && <span className="text-[10px] font-bold text-[#1447E6]">{cat.saleUzs.toLocaleString()} so'm</span>}
                          {cat.lowStock > 0 && (
                            <span className="text-[10px] font-bold text-red-500 bg-red-50 px-1.5 py-0.5 rounded-lg flex items-center gap-1">
                              <FiAlertCircle className="w-2.5 h-2.5" /> {cat.lowStock}
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="text-right shrink-0 flex items-center gap-1.5">
                        <div>
                          <p className={`text-lg font-black leading-tight ${isEmpty ? 'text-red-500' : 'text-gray-900'}`}>{cat.quantity.toLocaleString()}</p>
                          <p className="text-[10px] text-gray-400">dona</p>
                        </div>
                        <FiArrowRight className="w-4 h-4 text-gray-300" />
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Category Management Modal */}
      {showCategoryModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-md z-[70] flex items-center justify-center px-4" onClick={() => { setShowCategoryModal(false); setEditingCategory(null); }}>
          <div className="bg-white rounded-3xl p-5 w-full max-w-md shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-5">
              <div>
                <h2 className="text-lg font-bold text-gray-900">Kategoriyalar</h2>
                <p className="text-xs text-gray-400 mt-0.5">Mahsulot turlarini boshqarish</p>
              </div>
              <button
                onClick={() => { setShowCategoryModal(false); setEditingCategory(null); }}
                className="w-8 h-8 bg-gray-100 rounded-xl flex items-center justify-center text-gray-500"
              >
                <FiX className="w-4 h-4" />
              </button>
            </div>

            <div className="flex gap-2 mb-4">
              <input
                type="text"
                placeholder="Yangi kategoriya nomi..."
                value={newCategory}
                onChange={(e) => setNewCategory(e.target.value)}
                className="flex-1 px-4 py-2.5 bg-gray-50 border border-gray-100 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#1447E6]/20 focus:border-[#1447E6]"
              />
              <button
                onClick={handleAddCategory}
                disabled={createCategoryMutation.isPending}
                className="px-4 py-2.5 bg-[#1447E6] text-white rounded-xl font-bold hover:bg-blue-700 disabled:opacity-50"
              >
                {createCategoryMutation.isPending ? <FiLoader className="animate-spin w-4 h-4" /> : <FiPlus className="w-4 h-4" />}
              </button>
            </div>

            <div className="max-h-72 overflow-y-auto space-y-2">
              {categoriesLoading ? (
                <div className="flex justify-center py-4">
                  <FiLoader className="animate-spin text-gray-400" />
                </div>
              ) : categories.map((cat) => (
                <div key={cat.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl border border-transparent hover:border-gray-100 transition-all">
                  {editingCategory?.id === cat.id ? (
                    <div className="flex items-center gap-2 flex-1">
                      <input
                        type="text"
                        value={editValue}
                        onChange={(e) => setEditValue(e.target.value)}
                        className="flex-1 px-3 py-1.5 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1447E6]/20"
                        autoFocus
                      />
                      <button
                        onClick={handleUpdateCategory}
                        disabled={updateCategoryMutation.isPending}
                        className="w-7 h-7 bg-[#1447E6] text-white rounded-lg flex items-center justify-center"
                      >
                        {updateCategoryMutation.isPending ? <FiLoader className="animate-spin w-3 h-3" /> : <FiCheck className="w-3 h-3" />}
                      </button>
                    </div>
                  ) : (
                    <>
                      <span className="text-sm font-semibold text-gray-700">
                        {cat.name} <span className="text-[10px] text-gray-400">({cat.product_count})</span>
                      </span>
                      <div className="flex items-center gap-1">
                        <button onClick={() => handleStartEdit(cat)} className="w-7 h-7 text-gray-400 hover:text-[#1447E6] hover:bg-blue-50 rounded-lg transition-all flex items-center justify-center">
                          <FiEdit2 className="w-3.5 h-3.5" />
                        </button>
                        <button onClick={() => handleDeleteCategory(cat)} className="w-7 h-7 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all flex items-center justify-center">
                          <FiTrash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Category Delete Confirm */}
      {showCatDeleteConfirm && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-[80] flex items-center justify-center px-4" onClick={() => setShowCatDeleteConfirm(false)}>
          <div className="bg-white rounded-3xl p-7 w-full max-w-sm shadow-2xl border border-gray-100" onClick={(e) => e.stopPropagation()}>
            <div className="text-center">
              <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4">
                <FiAlertCircle className="w-8 h-8 text-red-500" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Kategoriyani o'chirish?</h3>
              <p className="text-sm text-gray-400 mb-6 leading-relaxed">
                <span className="font-bold text-gray-700">"{categoryToDelete?.name}"</span> kategoriyasini o'chirmoqchimisiz?
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowCatDeleteConfirm(false)}
                  className="flex-1 py-3.5 bg-gray-100 text-gray-600 rounded-2xl font-bold text-sm"
                >
                  Yo'q
                </button>
                <button
                  onClick={confirmDeleteCategory}
                  disabled={deleteCategoryMutation.isPending}
                  className="flex-1 py-3.5 bg-red-500 text-white rounded-2xl font-bold text-sm flex items-center justify-center gap-2 hover:bg-red-600"
                >
                  {deleteCategoryMutation.isPending && <FiLoader className="animate-spin w-4 h-4" />}
                  Ha, o'chirish
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Warehouse;
