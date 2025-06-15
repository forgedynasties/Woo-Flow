import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import Tree from 'react-d3-tree';
import { fetchCategories } from '../api/categoryApi';
import {
  Box,
  Card,
  CardContent,
  Typography,
  IconButton,
  ToggleButton,
  ToggleButtonGroup,
  CircularProgress,
  Paper
} from '@mui/material';
import {
  TableView as TableViewIcon,
  AccountTree as GraphViewIcon,
  Refresh as RefreshIcon
} from '@mui/icons-material';
import './Categories.css';

const Categories = ({ apiConfig }) => {
  const [categories, setCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [viewMode, setViewMode] = useState('table');

  const loadCategories = async () => {
    setIsLoading(true);
    try {
      const result = await fetchCategories(apiConfig);
      const hierarchical = buildCategoryTree(result);
      setCategories(hierarchical);
    } catch (error) {
      toast.error(`Failed to load categories: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (apiConfig.api_key) {
      loadCategories();
    }
  }, [apiConfig]);

  const buildCategoryTree = (flatCategories) => {
    const idMapping = flatCategories.reduce((acc, category) => {
      acc[category.id] = category;
      return acc;
    }, {});

    const root = [];

    flatCategories.forEach(category => {
      if (!category.parent) {
        root.push(category);
        return;
      }

      if (idMapping[category.parent]) {
        if (!idMapping[category.parent].children) {
          idMapping[category.parent].children = [];
        }
        idMapping[category.parent].children.push(category);
      }
    });

    return root;
  };

  // Transform category data for react-d3-tree
  const transformCategory = (category) => {
    return {
      name: category.name,
      attributes: {
        count: category.count,
        slug: category.slug
      },
      children: category.children ? category.children.map(child => transformCategory(child)) : []
    };
  };

  const treeData = categories.map(category => ({
    name: category.name,
    attributes: {
      count: category.count,
      slug: category.slug,
      description: category.description
    },
    children: category.children ? category.children.map(transformCategory) : []
  }));

  const renderGraph = () => (
    <Box sx={{ height: '600px', width: '100%' }}>
      <Tree
        data={treeData}
        orientation="vertical"
        pathFunc="step"
        separation={{ siblings: 2, nonSiblings: 2.5 }}
        renderCustomNodeElement={({ nodeDatum, toggleNode }) => (
          <g>
            <circle
              r={15}
              onClick={toggleNode}
              fill={nodeDatum.attributes.count > 0 ? '#2196f3' : '#90caf9'}
            />
            <text
              dy=".31em"
              x={20}
              textAnchor="start"
              style={{ fontSize: '12px' }}
            >
              {nodeDatum.name}
            </text>
            <text
              dy="1.5em"
              x={20}
              textAnchor="start"
              style={{ fontSize: '10px', fill: '#666' }}
            >
              {`Products: ${nodeDatum.attributes.count}`}
            </text>
          </g>
        )}
      />
    </Box>
  );

  const renderTable = () => (
    <Paper sx={{ width: '100%', overflow: 'hidden' }}>
      <table className="category-table">
        <thead>
          <tr>
            <th>Name</th>
            <th>Slug</th>
            <th>Count</th>
            <th>Description</th>
          </tr>
        </thead>
        <tbody>
          {renderCategoryRows(categories)}
        </tbody>
      </table>
    </Paper>
  );

  return (
    <Box sx={{ p: 3 }}>
      <Card>
        <CardContent>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            <Typography variant="h5" component="h2">
              Product Categories
            </Typography>
            <Box sx={{ display: 'flex', gap: 2 }}>
              <ToggleButtonGroup
                value={viewMode}
                exclusive
                onChange={(e, newMode) => newMode && setViewMode(newMode)}
                size="small"
              >
                <ToggleButton value="table">
                  <TableViewIcon />
                </ToggleButton>
                <ToggleButton value="graph">
                  <GraphViewIcon />
                </ToggleButton>
              </ToggleButtonGroup>
              <IconButton onClick={loadCategories} color="primary">
                <RefreshIcon />
              </IconButton>
            </Box>
          </Box>

          {isLoading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
              <CircularProgress />
            </Box>
          ) : categories.length === 0 ? (
            <Box sx={{ textAlign: 'center', p: 3 }}>
              <Typography color="textSecondary">
                No categories found in your store.
              </Typography>
            </Box>
          ) : (
            viewMode === 'table' ? renderTable() : renderGraph()
          )}
        </CardContent>
      </Card>
    </Box>
  );
};

const renderCategoryRows = (categories, level = 0) => {
  return categories.flatMap(category => {
    const rows = [
      <tr key={category.id}>
        <td>
          <Box sx={{ display: 'flex', alignItems: 'center', pl: level * 2 }}>
            {level > 0 && <span className="category-indent">└</span>}
            <Typography>{category.name}</Typography>
          </Box>
        </td>
        <td>{category.slug}</td>
        <td>{category.count}</td>
        <td>
          {category.description ? (
            <Typography variant="body2" color="textSecondary">
              {category.description}
            </Typography>
          ) : (
            <Typography variant="body2" color="textSecondary">
              No description
            </Typography>
          )}
        </td>
      </tr>
    ];

    if (category.children && category.children.length > 0) {
      rows.push(...renderCategoryRows(category.children, level + 1));
    }

    return rows;
  });
};

export default Categories;
