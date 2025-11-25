import Link from "next/link";

export function Footer() {
  return (
    <footer className="mt-16 border-t border-gray-200 bg-white/50 py-6 backdrop-blur-sm">
      <div className="mx-auto max-w-6xl px-6">
        <p className="text-center text-sm text-gray-600">
          Website built by{" "}
          <Link
            href="https://www.linkedin.com/in/c-varun/"
            target="_blank"
            rel="noopener noreferrer"
            className="font-medium text-indigo-600 transition-colors hover:text-indigo-700 hover:underline"
          >
            C Varun
          </Link>
        </p>
      </div>
    </footer>
  );
}
