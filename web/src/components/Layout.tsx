import React from "react";
import { useNavigate } from "react-router-dom";

interface LayoutProps {
  title?: string;
  showBackButton?: boolean;
  noPadding?: boolean;
  showFooter?: boolean;
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({
  title,
  showBackButton = true,
  noPadding = false,
  showFooter = false,
  children,
}) => {
  const navigate = useNavigate();

  const handleBack = () => {
    navigate(-1);
  };

  return (
    <div className="flex flex-col min-h-screen w-full bg-background-default md:max-w-md md:mx-auto md:shadow-md">
      <header className="flex items-center p-4 bg-background-paper border-b border-border-light sticky top-0 z-10">
        {showBackButton && (
          <button
            className="bg-transparent border-none cursor-pointer text-lg text-primary-main flex items-center p-2 mr-2"
            onClick={handleBack}
          >
            ←
          </button>
        )}
        {title && <h1 className="text-xl text-text-primary font-bold m-0 flex-1">{title}</h1>}
      </header>

      <main className={`flex-1 overflow-y-auto ${noPadding ? "p-0" : "p-4"}`}>{children}</main>

      {showFooter && (
        <footer className="p-4 bg-background-paper border-t border-border-light text-center text-text-secondary text-sm">
          &copy; {new Date().getFullYear()} URIWA 모바일
        </footer>
      )}
    </div>
  );
};

export default Layout;
