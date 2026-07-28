export default function PageHeader({ title, description, actions }) {
  if (!actions) return null
  return (
    <div className="mb-5 flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
      <div className="flex-1" />
      <div className="flex w-full flex-wrap gap-2 sm:w-auto [&>*]:max-sm:flex-1">{actions}</div>
    </div>
  )
}
