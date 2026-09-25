export default function PageHeader({ title, description, actions }) {
  return (
    <div className="mb-5 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
      <div>
        <h1 className="text-[22px] font-semibold leading-8 text-slate-900 sm:text-[24px]">{title}</h1>
        {description && <p className="mt-1 text-[13px] leading-5 text-slate-500 sm:text-[14px]">{description}</p>}
      </div>
      {actions && <div className="flex w-full flex-wrap gap-2 sm:w-auto [&>*]:max-sm:flex-1">{actions}</div>}
    </div>
  )
}
