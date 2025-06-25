"use client";

interface ProductPreviewCardProps {
  product: any;
}

export function ProductPreviewCard({ product }: ProductPreviewCardProps) {
  // Determine product type for display
  const productType = product.type || 'simple';
  
  // Extract image URL if available
  let imageUrl = '';
  if (product.image_1) {
    imageUrl = product.image_1;
  }
  
  // Format attributes if available
  const attributes: string[] = [];
  for (let i = 1; i <= 5; i++) {
    const attrName = product[`attr_name_${i}`];
    const attrValue = product[`attr_value_${i}`];
    if (attrName && attrValue) {
      attributes.push(`${attrName}: ${attrValue}`);
    }
  }
  
  return (
    <div className="border border-zinc-200 rounded-lg overflow-hidden bg-card">
      <div className="p-4">
        <div className="flex justify-between items-start mb-2">
          <h3 className="font-medium truncate" title={product.name || 'Unnamed Product'}>
            {product.name || 'Unnamed Product'}
          </h3>
          <span className={`text-xs px-2 py-1 rounded-full ${
            productType === 'simple' ? 'bg-blue-100 text-blue-700' : 
            productType === 'variable' ? 'bg-purple-100 text-purple-700' :
            'bg-green-100 text-green-700'
          }`}>
            {productType}
          </span>
        </div>
        
        {imageUrl && (
          <div className="aspect-square w-full mb-3 bg-muted/30 rounded-md overflow-hidden relative">
            <img 
              src={imageUrl}
              alt={product.name || 'Product image'}
              className="w-full h-full object-cover"
              onError={(e) => {
                // Set a fallback image on error
                (e.target as HTMLImageElement).src = '/product-placeholder.png';
              }}
            />
          </div>
        )}
        
        <div className="space-y-1 text-sm">
          {product.sku && (
            <div className="flex justify-between">
              <span className="text-muted-foreground">SKU:</span>
              <span className="font-medium">{product.sku}</span>
            </div>
          )}
          
          {(product.regular_price || product.price) && (
            <div className="flex justify-between">
              <span className="text-muted-foreground">Price:</span>
              <span className="font-medium">${product.regular_price || product.price}</span>
            </div>
          )}
          
          {product.stock_quantity && (
            <div className="flex justify-between">
              <span className="text-muted-foreground">Stock:</span>
              <span className="font-medium">{product.stock_quantity}</span>
            </div>
          )}
          
          {product.category_1 && (
            <div className="flex justify-between">
              <span className="text-muted-foreground">Category:</span>
              <span className="font-medium">{product.category_1}</span>
            </div>
          )}
        </div>
        
        {attributes.length > 0 && (
          <div className="mt-3 pt-3 border-t border-zinc-200">
            <p className="text-xs text-muted-foreground mb-1">Attributes:</p>
            <div className="flex flex-wrap gap-1">
              {attributes.map((attr, idx) => (
                <span 
                  key={idx}
                  className="text-xs px-2 py-1 bg-muted/50 rounded-md"
                  title={attr}
                >
                  {attr.length > 20 ? `${attr.substring(0, 20)}...` : attr}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
