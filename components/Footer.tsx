"use client";

export const Footer = () => {
  return (
    <footer className="w-full border-t border-border bg-background py-6">
      <div className="container mx-auto px-4 text-center">
        <p className="text-sm text-neutral-500">
          © {new Date().getFullYear()} 日報作成支援. All rights reserved.
        </p>
      </div>
    </footer>
  );
};
