export default function EmptyState({ title, description, children }) {
    return (
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-8 text-center mb-8">
            <div className="text-4xl mb-3">✈️</div>
            <h3 className="text-lg font-semibold text-gray-800 mb-2">{title}</h3>
            {description && (
                <p className="text-sm text-gray-500 max-w-md mx-auto">{description}</p>
            )}
            {children}
        </div>
    );
}
