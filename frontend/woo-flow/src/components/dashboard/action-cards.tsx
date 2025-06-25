"use client";

import Link from "next/link";
import { useState } from "react";
import { ImportProductsModal } from "@/components/products/import-products-modal";
import { ExportProductsModal } from "@/components/products/export-products-modal";

export function ActionCards() {
  const [importModalOpen, setImportModalOpen] = useState(false);
  const [exportModalOpen, setExportModalOpen] = useState(false);

  return (
    <>
      <div className="bg-card text-card-foreground p-6 rounded-lg shadow-sm">
        <h2 className="text-xl font-semibold mb-4">Action Cards</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <ActionCard
            title="Import Products"
            description="Import products from CSV file"
            icon="file_upload"
            buttonText="Upload CSV"
            onClick={() => setImportModalOpen(true)}
          />
          <ActionCard
            title="Export Products"
            description="Export products to CSV file"
            icon="file_download"
            buttonText="Export"
            onClick={() => setExportModalOpen(true)}
          />
          <ActionCard
            title="Manage Categories"
            description="Create or update product categories"
            icon="folder"
            buttonText="Manage"
            href="/categories"
          />
          <ActionCard
            title="Bulk Update"
            description="Update multiple products at once"
            icon="update"
            buttonText="Update"
            href="/products/bulk-update"
          />
        </div>
      </div>

      {/* Modals */}
      <ImportProductsModal
        isOpen={importModalOpen}
        onClose={() => setImportModalOpen(false)}
      />
      <ExportProductsModal
        isOpen={exportModalOpen}
        onClose={() => setExportModalOpen(false)}
      />
    </>
  );
}

interface ActionCardProps {
  title: string;
  description: string;
  icon: string;
  buttonText: string;
  onClick?: () => void;
  href?: string;
}

function ActionCard({
  title,
  description,
  icon,
  buttonText,
  onClick,
  href,
}: ActionCardProps) {
  const buttonContent = (
    <>
      {buttonText}
      <span className="material-icons text-sm ml-1">arrow_forward</span>
    </>
  );

  return (
    <div className="bg-muted/30 p-4 rounded-lg border border-zinc-200 flex flex-col h-full">
      <div className="flex items-start mb-3">
        <div className="bg-primary/10 p-2 rounded-full mr-3">
          <span className="material-icons text-primary">{icon}</span>
        </div>
        <div>
          <h3 className="font-medium">{title}</h3>
          <p className="text-sm text-muted-foreground">{description}</p>
        </div>
      </div>
      <div className="mt-auto">
        {href ? (
          <Link
            href={href}
            className="w-full mt-2 px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-opacity-80 text-sm flex items-center justify-center"
          >
            {buttonContent}
          </Link>
        ) : (
          <button
            className="w-full mt-2 px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-opacity-80 text-sm flex items-center justify-center"
            onClick={onClick}
          >
            {buttonContent}
          </button>
        )}
      </div>
    </div>
  );
}
