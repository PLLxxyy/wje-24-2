import { Router } from 'express'
import { db } from '../database'
import { toCamelCase, toCamelCaseArray } from '../utils'

const router = Router()

router.get('/projects/:projectId/materials', (req, res) => {
  const items = db.prepare('SELECT * FROM materials WHERE project_id = ? ORDER BY purchase_date DESC').all(req.params.projectId)
  res.json(toCamelCaseArray(items as Record<string, any>[]))
})

router.post('/projects/:projectId/materials', (req, res) => {
  const { name, category, quantity, price, purchaseDate, storeName, location, notes } = req.body
  const result = db.prepare(`
    INSERT INTO materials (project_id, name, category, quantity, price, purchase_date, store_name, location, notes)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(req.params.projectId, name, category || '', quantity || '', price || 0, purchaseDate || null, storeName || '', location || '', notes || '')
  const item = db.prepare('SELECT * FROM materials WHERE id = ?').get(result.lastInsertRowid)
  res.json(toCamelCase(item as Record<string, any>))
})

router.put('/materials/:id', (req, res) => {
  const { name, category, quantity, price, purchaseDate, storeName, location, notes } = req.body
  db.prepare(`
    UPDATE materials SET
      name = ?, category = ?, quantity = ?, price = ?, purchase_date = ?, store_name = ?, location = ?, notes = ?
    WHERE id = ?
  `).run(name, category || '', quantity || '', price || 0, purchaseDate || null, storeName || '', location || '', notes || '', req.params.id)
  const item = db.prepare('SELECT * FROM materials WHERE id = ?').get(req.params.id)
  res.json(toCamelCase(item as Record<string, any>))
})

router.delete('/materials/:id', (req, res) => {
  db.prepare('DELETE FROM materials WHERE id = ?').run(req.params.id)
  res.json({ ok: true })
})

export default router
