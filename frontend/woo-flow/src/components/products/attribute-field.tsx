"use client";

import { useState } from "react";

interface AttributeFieldProps {
  attributes: any[];
  onChange: (attributes: any[]) => void;
  isVariableProduct: boolean;
}

export function AttributeField({ attributes, onChange, isVariableProduct }: AttributeFieldProps) {
  const [newAttributeName, setNewAttributeName] = useState("");
  const [newAttributeValues, setNewAttributeValues] = useState("");
  const [attributeForVariation, setAttributeForVariation] = useState(false);
  
  const addAttribute = () => {
    if (!newAttributeName.trim() || !newAttributeValues.trim()) return;
    
    const newAttribute = {
      name: newAttributeName,
      options: newAttributeValues.split(',').map(v => v.trim()),
      position: attributes.length,
      visible: true,
      variation: attributeForVariation,
    };
    
    onChange([...attributes, newAttribute]);
    setNewAttributeName("");
    setNewAttributeValues("");
    setAttributeForVariation(false);
  };
  
  const removeAttribute = (index: number) => {
    const newAttributes = [...attributes];
    newAttributes.splice(index, 1);
    onChange(newAttributes);
  };
  
  const updateAttribute = (index: number, field: string, value: any) => {
    const newAttributes = [...attributes];
    newAttributes[index] = { ...newAttributes[index], [field]: value };
    onChange(newAttributes);
  };

  return (
    <div className="space-y-6">
      <div className="bg-muted/30 p-4 rounded-lg">
        <h3 className="font-medium mb-2">Product Attributes</h3>
        <p className="text-sm text-muted-foreground">
          Add attributes to define properties like size, color, etc.
          {isVariableProduct && " For variable products, you can use attributes to create variations."}
        </p>
      </div>
      
      {/* Existing attributes list */}
      {attributes.length > 0 && (
        <div className="space-y-4">
          <h4 className="font-medium">Current Attributes</h4>
          {attributes.map((attr, index) => (
            <div key={index} className="border border-zinc-200 rounded-md p-4">
              <div className="flex justify-between mb-2">
                <span className="font-medium">{attr.name}</span>
                <button 
                  type="button"
                  onClick={() => removeAttribute(index)}
                  className="text-red-500 hover:text-red-700"
                >
                  <span className="material-icons text-sm">delete</span>
                </button>
              </div>
              
              <div className="mb-2">
                <label className="text-sm text-muted-foreground mb-1 block">Values (comma separated)</label>
                <input 
                  type="text" 
                  className="w-full p-2 border border-zinc-200 rounded-md"
                  value={attr.options.join(', ')}
                  onChange={(e) => updateAttribute(index, 'options', e.target.value.split(',').map(v => v.trim()))}
                />
              </div>
              
              {isVariableProduct && (
                <div className="flex items-center">
                  <input 
                    type="checkbox"
                    id={`variation-${index}`}
                    checked={attr.variation}
                    onChange={(e) => updateAttribute(index, 'variation', e.target.checked)}
                    className="mr-2"
                  />
                  <label htmlFor={`variation-${index}`} className="text-sm">
                    Used for variations
                  </label>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
      
      {/* Add new attribute form */}
      <div className="border border-zinc-200 rounded-md p-4">
        <h4 className="font-medium mb-4">Add New Attribute</h4>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Attribute Name</label>
            <input 
              type="text" 
              className="w-full p-2 border border-zinc-200 rounded-md"
              placeholder="e.g., Color, Size"
              value={newAttributeName}
              onChange={(e) => setNewAttributeName(e.target.value)}
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1">Values (comma separated)</label>
            <input 
              type="text" 
              className="w-full p-2 border border-zinc-200 rounded-md"
              placeholder="e.g., Red, Blue, Green"
              value={newAttributeValues}
              onChange={(e) => setNewAttributeValues(e.target.value)}
            />
          </div>
          
          {isVariableProduct && (
            <div className="flex items-center">
              <input 
                type="checkbox"
                id="new-attr-variation"
                checked={attributeForVariation}
                onChange={(e) => setAttributeForVariation(e.target.checked)}
                className="mr-2"
              />
              <label htmlFor="new-attr-variation" className="text-sm">
                Used for variations
              </label>
            </div>
          )}
          
          <button
            type="button"
            className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-opacity-80"
            onClick={addAttribute}
          >
            Add Attribute
          </button>
        </div>
      </div>
    </div>
  );
}
