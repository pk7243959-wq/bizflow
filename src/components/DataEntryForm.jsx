import { useState } from 'react'

const EMPTY_VALUES = {
  name: '',
  email: '',
  amount: '',
  date: '',
  notes: '',
}

export default function DataEntryForm({ onSubmit = () => {} }) {
  const [values, setValues] = useState(EMPTY_VALUES)

  function handleChange(event) {
    const { name, value } = event.target
    setValues((prev) => ({ ...prev, [name]: value }))
  }

  function handleSubmit(event) {
    event.preventDefault()
    onSubmit(values)
    setValues(EMPTY_VALUES)
  }

  return (
    <form onSubmit={handleSubmit}>
      <div>
        <label htmlFor="dataentry-name">Name</label>
        <input
          id="dataentry-name"
          name="name"
          type="text"
          required
          value={values.name}
          onChange={handleChange}
        />
      </div>

      <div>
        <label htmlFor="dataentry-email">Email</label>
        <input
          id="dataentry-email"
          name="email"
          type="email"
          value={values.email}
          onChange={handleChange}
        />
      </div>

      <div>
        <label htmlFor="dataentry-amount">Amount</label>
        <input
          id="dataentry-amount"
          name="amount"
          type="number"
          step="0.01"
          value={values.amount}
          onChange={handleChange}
        />
      </div>

      <div>
        <label htmlFor="dataentry-date">Date</label>
        <input
          id="dataentry-date"
          name="date"
          type="date"
          value={values.date}
          onChange={handleChange}
        />
      </div>

      <div>
        <label htmlFor="dataentry-notes">Notes</label>
        <textarea
          id="dataentry-notes"
          name="notes"
          value={values.notes}
          onChange={handleChange}
        />
      </div>

      <button type="submit">Save</button>
    </form>
  )
}
