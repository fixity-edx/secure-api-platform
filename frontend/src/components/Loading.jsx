export default function Loading() {
    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 to-secondary-50">
            <div className="text-center">
                <div className="relative w-24 h-24 mx-auto mb-4">
                    <div className="absolute top-0 left-0 w-full h-full border-4 border-primary-200 rounded-full"></div>
                    <div className="absolute top-0 left-0 w-full h-full border-4 border-primary-600 rounded-full border-t-transparent animate-spin"></div>
                </div>
                <h2 className="text-xl font-semibold text-gray-700">Loading...</h2>
                <p className="text-gray-500 mt-2">Please wait</p>
            </div>
        </div>
    );
}
