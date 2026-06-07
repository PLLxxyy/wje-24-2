import { useState, useMemo } from 'react'
import { useParams } from 'react-router-dom'
import { ArrowLeft, Plus, Trash2, Edit2, X, Check } from 'lucide-react'
import { useMaterials } from '@/hooks/useMaterials'
import { formatDate, formatMoney } from '@/utils/format'
import type { MaterialItem } from '@/types'

const emptyForm = { name: '', category: '', quantity: '', price: '', purchaseDate: '', storeName: '', location: '', notes: '' }
const categories = ['瓷砖', '地板', '涂料', '五金', '灯具', '洁具', '橱柜', '门窗', '其他']

export default function Materials() {
  const { id } = useParams<{ id: string }>()
  const projectId = Number(id)
  const { items, addItem, updateItem, deleteItem } = useMaterials(projectId)
  const [showAddForm, setShowAddForm] = useState(false)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [form, setForm] = useState(emptyForm)
  const [editForm, setEditForm] = useState(emptyForm)

  const groupedItems = useMemo(() => {
    const groups: Record<string, MaterialItem[]> = {}
    items.forEach((item) => {
      const key = item.purchaseDate || '未指定日期'
      if (!groups[key]) groups[key] = []
      groups[key].push(item)
    })
    return Object.entries(groups).sort((a, b) => {
      if (a[0] === '未指定日期') return 1
      if (b[0] === '未指定日期') return -1
      return b[0].localeCompare(a[0])
    })
  }, [items])

  const totalSpent = items.reduce((s, i) => s + i.price, 0)

  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    await addItem({
      name: form.name,
      category: form.category,
      quantity: form.quantity,
      price: Number(form.price),
      purchaseDate: form.purchaseDate,
      storeName: form.storeName,
      location: form.location,
      notes: form.notes,
    })
    setForm(emptyForm)
    setShowAddForm(false)
  }

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingId) return
    await updateItem(editingId, {
      name: editForm.name,
      category: editForm.category,
      quantity: editForm.quantity,
      price: Number(editForm.price),
      purchaseDate: editForm.purchaseDate,
      storeName: editForm.storeName,
      location: editForm.location,
      notes: editForm.notes,
    })
    setEditingId(null)
    setEditForm(emptyForm)
  }

  const startEdit = (item: MaterialItem) => {
    setEditingId(item.id)
    setEditForm({
      name: item.name,
      category: item.category,
      quantity: item.quantity,
      price: String(item.price),
      purchaseDate: item.purchaseDate,
      storeName: item.storeName,
      location: item.location,
      notes: item.notes,
    })
  }

  const cancelEdit = () => {
    setEditingId(null)
    setEditForm(emptyForm)
  }

  const renderForm = (formData: typeof emptyForm, setFormData: (f: typeof emptyForm) => void, onSubmit: (e: React.FormEvent) => void, onCancel: () => void, isEdit: boolean) => (
    <form onSubmit={onSubmit} className="bg-white rounded-xl shadow p-4 mb-4 space-y-3">
      <div className="grid grid-cols-2 gap-3">
        <input placeholder="材料名称" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} className="border rounded-lg px-3 py-2 text-sm" required />
        <select value={formData.category} onChange={(e) => setFormData({ ...formData, category: e.target.value })} className="border rounded-lg px-3 py-2 text-sm" required>
          <option value="">选择分类</option>
          {categories.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
        <input placeholder="数量/规格" value={formData.quantity} onChange={(e) => setFormData({ ...formData, quantity: e.target.value })} className="border rounded-lg px-3 py-2 text-sm" />
        <input type="number" placeholder="价格" value={formData.price} onChange={(e) => setFormData({ ...formData, price: e.target.value })} className="border rounded-lg px-3 py-2 text-sm" required />
        <input type="date" value={formData.purchaseDate} onChange={(e) => setFormData({ ...formData, purchaseDate: e.target.value })} className="border rounded-lg px-3 py-2 text-sm" />
        <input placeholder="购买店铺" value={formData.storeName} onChange={(e) => setFormData({ ...formData, storeName: e.target.value })} className="border rounded-lg px-3 py-2 text-sm" />
        <input placeholder="存放位置" value={formData.location} onChange={(e) => setFormData({ ...formData, location: e.target.value })} className="border rounded-lg px-3 py-2 text-sm" />
      </div>
      <textarea placeholder="备注" value={formData.notes} onChange={(e) => setFormData({ ...formData, notes: e.target.value })} className="w-full border rounded-lg px-3 py-2 text-sm" />
      <div className="flex gap-2">
        <button type="submit" className="flex items-center gap-1 bg-blue-600 text-white px-4 py-2 rounded-lg text-sm">
          <Check size={14} /> {isEdit ? '保存修改' : '保存'}
        </button>
        <button type="button" onClick={onCancel} className="flex items-center gap-1 text-gray-500 px-4 py-2 text-sm">
          <X size={14} /> 取消
        </button>
      </div>
    </form>
  )

  return (
    <div>
      <div className="flex items-center gap-2 mb-4">
        <button onClick={() => window.history.back()} className="text-gray-500 hover:text-gray-700"><ArrowLeft size={20} /></button>
        <h1 className="text-xl font-bold">材料采购清单</h1>
      </div>

      <div className="bg-white rounded-xl shadow p-4 mb-4 flex justify-between items-center">
        <span className="text-sm text-gray-600">共 {items.length} 项，已花费 {formatMoney(totalSpent)}</span>
        <button onClick={() => setShowAddForm(true)} className="flex items-center gap-1 bg-blue-600 text-white px-3 py-2 rounded-lg text-sm hover:bg-blue-700">
          <Plus size={16} /> 添加材料
        </button>
      </div>

      {showAddForm && renderForm(form, setForm, handleAddSubmit, () => setShowAddForm(false), false)}

      <div className="space-y-6">
        {groupedItems.map(([date, dateItems]) => (
          <div key={date}>
            <div className="flex items-center gap-2 mb-3">
              <div className="h-px bg-gray-200 flex-1" />
              <span className="text-sm font-medium text-gray-500 px-2">
                {date === '未指定日期' ? date : formatDate(date)}
                <span className="text-gray-400 font-normal ml-1">({dateItems.length} 项)</span>
              </span>
              <div className="h-px bg-gray-200 flex-1" />
            </div>
            <div className="space-y-3">
              {dateItems.map((item) => (
                <div key={item.id}>
                  {editingId === item.id ? (
                    renderForm(editForm, setEditForm, handleEditSubmit, cancelEdit, true)
                  ) : (
                    <div className="bg-white rounded-xl shadow p-4 flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-sm">{item.name}</span>
                          <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded">{item.category}</span>
                        </div>
                        <div className="text-xs text-gray-500 mt-1">
                          {item.quantity} · {formatMoney(item.price)} · {item.storeName} · {item.location}
                        </div>
                        {item.notes && <div className="text-xs text-gray-400 mt-1">{item.notes}</div>}
                      </div>
                      <div className="flex gap-1 ml-3">
                        <button onClick={() => startEdit(item)} className="text-gray-400 hover:text-blue-500 p-1" title="编辑">
                          <Edit2 size={16} />
                        </button>
                        <button onClick={() => deleteItem(item.id)} className="text-gray-400 hover:text-red-500 p-1" title="删除">
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {items.length === 0 && <div className="text-center text-gray-400 mt-8">还没有材料记录</div>}
    </div>
  )
}
