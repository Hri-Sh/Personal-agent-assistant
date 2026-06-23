import { useState, useEffect } from 'react'
import { Trash2, Plus, Check } from 'lucide-react'
import './BucketList.css'
import AddListModal from '../components/AddListModal'
import { supabase } from '../lib/supabase'
import { fireConfetti } from '../lib/confetti'

// DB columns are snake_case; bucket_items come nested from the join
function dbToList(row) {
  return {
    id:    row.id,
    name:  row.name,
    color: row.color,
    items: (row.bucket_items ?? [])
      .slice()
      .sort((a, b) => a.id - b.id)
      .map(i => ({ id: i.id, title: i.title, done: i.done })),
  }
}

function listToDb(list) {
  return {
    name:  list.name,
    color: list.color,
  }
}

export default function BucketList() {
  const [lists, setLists] = useState([])
  const [showModal, setShowModal] = useState(false)
  const [itemDrafts, setItemDrafts] = useState({}) // { [listId]: string }

  // Load lists + their items on mount
  useEffect(() => {
    supabase
      .from('bucket_lists')
      .select('*, bucket_items(*)')
      .then(({ data, error }) => {
        if (error) { console.error('Error loading lists:', error); return }
        setLists(data.map(dbToList))
      })
  }, [])

  async function handleAddList(form) {
    const { data, error } = await supabase
      .from('bucket_lists')
      .insert(listToDb(form))
      .select('*, bucket_items(*)')
      .single()
    if (error) { console.error('Error adding list:', error); return }
    setLists(prev => [...prev, dbToList(data)])
  }

  async function handleDeleteList(id) {
    const { error } = await supabase.from('bucket_lists').delete().eq('id', id)
    if (error) { console.error('Error deleting list:', error); return }
    setLists(prev => prev.filter(l => l.id !== id))
  }

  async function handleAddItem(listId) {
    const title = (itemDrafts[listId] ?? '').trim()
    if (!title) return
    const { data, error } = await supabase
      .from('bucket_items')
      .insert({ list_id: listId, title })
      .select()
      .single()
    if (error) { console.error('Error adding item:', error); return }
    setLists(prev => prev.map(l =>
      l.id === listId
        ? { ...l, items: [...l.items, { id: data.id, title: data.title, done: data.done }] }
        : l
    ))
    setItemDrafts(d => ({ ...d, [listId]: '' }))
  }

  async function handleToggleItem(listId, item) {
    const { error } = await supabase
      .from('bucket_items')
      .update({ done: !item.done })
      .eq('id', item.id)
    if (error) { console.error('Error toggling item:', error); return }

    // Compute completion from current state synchronously (state updates are async)
    const list = lists.find(l => l.id === listId)
    const newItems = list.items.map(i => i.id === item.id ? { ...i, done: !i.done } : i)
    const wasComplete = list.items.length > 0 && list.items.every(i => i.done)
    const nowComplete = newItems.length > 0 && newItems.every(i => i.done)

    setLists(prev => prev.map(l => l.id === listId ? { ...l, items: newItems } : l))

    if (!wasComplete && nowComplete) fireConfetti({ count: 110, power: 12, spread: 1.7 })
  }

  async function handleDeleteItem(listId, itemId) {
    const { error } = await supabase.from('bucket_items').delete().eq('id', itemId)
    if (error) { console.error('Error deleting item:', error); return }
    setLists(prev => prev.map(l =>
      l.id === listId ? { ...l, items: l.items.filter(i => i.id !== itemId) } : l
    ))
  }

  return (
    <div className="bucket-page page-enter">
      <div className="bucket-header">
        <div>
          <h2>Bucket List</h2>
          <span className="bucket-date">
            {new Date().toLocaleDateString('en-AU', { weekday: 'long', day: 'numeric', month: 'long' })}
          </span>
        </div>
        <button className="add-list-btn" onClick={() => setShowModal(true)}>+ New List</button>
      </div>

      <div className="bucket-lists">
        {lists.length === 0 && (
          <p className="bucket-empty">No lists yet. Create one to get started.</p>
        )}

        {lists.map((list, li) => {
          const total = list.items.length
          const done = list.items.filter(i => i.done).length
          const pct = total === 0 ? 0 : Math.round((done / total) * 100)

          return (
            <div
              key={list.id}
              className={`bucket-card stagger-item ${pct === 100 ? 'is-complete' : ''}`}
              style={{ '--i': li }}
            >
              <div className="bucket-card-top">
                <div className="bucket-color-dot" style={{ background: list.color }} />
                <span className="bucket-name">{list.name}</span>
                <span className="bucket-count">{done}/{total}</span>
                <button
                  className="bucket-delete-btn"
                  onClick={() => handleDeleteList(list.id)}
                  title="Delete list"
                >
                  <Trash2 size={15} />
                </button>
              </div>

              <div className="bucket-progress-bar">
                <div
                  className="bucket-progress-fill fill-animated"
                  style={{ width: `${pct}%`, background: list.color }}
                />
              </div>

              <div className="bucket-items">
                {list.items.map(item => (
                  <div key={item.id} className={`bucket-item ${item.done ? 'done' : ''}`}>
                    <button
                      className={`bucket-item-check ${item.done ? 'checked' : ''}`}
                      style={item.done ? { background: list.color, borderColor: list.color } : null}
                      onClick={() => handleToggleItem(list.id, item)}
                      title={item.done ? 'Mark incomplete' : 'Mark complete'}
                    >
                      {item.done && <Check size={12} strokeWidth={3} />}
                    </button>
                    <span className="bucket-item-title">{item.title}</span>
                    <button
                      className="bucket-item-delete"
                      onClick={() => handleDeleteItem(list.id, item.id)}
                      title="Delete item"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                ))}

                <form
                  className="bucket-add-item"
                  onSubmit={e => { e.preventDefault(); handleAddItem(list.id) }}
                >
                  <input
                    type="text"
                    placeholder="Add an item..."
                    value={itemDrafts[list.id] ?? ''}
                    onChange={e => setItemDrafts(d => ({ ...d, [list.id]: e.target.value }))}
                  />
                  <button type="submit" className="bucket-add-item-btn" title="Add item">
                    <Plus size={15} />
                  </button>
                </form>
              </div>
            </div>
          )
        })}
      </div>

      {showModal && (
        <AddListModal onAdd={handleAddList} onClose={() => setShowModal(false)} />
      )}
    </div>
  )
}
