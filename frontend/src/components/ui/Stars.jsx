const SIZES = { sm: 'text-xs', md: 'text-sm', lg: 'text-lg' };

export default function Stars({ average = 0, count = 0, size = 'md', showCount = true }) {
  const rounded = Math.round(average);
  return (
    <div className={`flex items-center gap-1 ${SIZES[size] || SIZES.md}`}>
      <span className="text-amber-400 leading-none">
        {'★'.repeat(rounded)}
        <span className="text-stone-300 dark:text-stone-600">{'★'.repeat(5 - rounded)}</span>
      </span>
      <span className="text-stone-400 dark:text-stone-500 font-medium">
        ({average.toFixed(1)}){showCount && count > 0 ? ` · ${count}` : ''}
      </span>
    </div>
  );
}
