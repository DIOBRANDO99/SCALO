export default function LoadingSpinner() {
    return (
        <div className="flex flex-col items-center justify-center py-16">
            <div className="h-10 w-10 border-4 border-gray-200 border-t-blue-600 rounded-full animate-spin" />
            <p className="mt-4 text-sm text-gray-500">Searching flights…</p>
        </div>
    );
}
