# MongoDB Atlas Search Setup for VizTube

This guide provides step-by-step instructions to configure MongoDB Atlas Search for the VizTube video streaming platform. Atlas Search powers the advanced search functionality in the `GET /api/v1/videos` endpoint, enabling users to search videos by title and description.

## 🎯 Overview

The VizTube API includes a powerful text search feature that allows users to find videos using natural language queries. This functionality is powered by **MongoDB Atlas Search**, which requires a one-time setup of a search index on your `videos` collection.

### Search Capabilities
- **Full-text search** across video titles and descriptions
- **Fuzzy matching** for typos and partial words
- **Relevance scoring** for better search results
- **Fast query performance** with indexed searches

## 📋 Prerequisites

Before starting, ensure you have:
- **MongoDB Atlas Account** with an active cluster
- **VizTube Database** deployed with video collections
- **Cluster Access** with sufficient permissions to create indexes

## 🚀 Step-by-Step Setup

### Step 1: Access Your MongoDB Atlas Cluster

1. **Login to Atlas**:
   - Navigate to [MongoDB Atlas](https://cloud.mongodb.com/)
   - Sign in with your credentials

2. **Select Your Project**:
   - From the "Projects" page, click your project name (e.g., "VizTube" or "Testing")

3. **Navigate to Cluster**:
   - On the "Database Deployments" page, click your cluster name (e.g., "Cluster0")
   - You'll be redirected to the cluster overview dashboard

4. **Open Search Tab**:
   - Click the **Search** tab in the top navigation menu
   - This opens the Atlas Search management interface

### Step 2: Create the Search Index

1. **Initialize Index Creation**:
   - Click the green **Create Search Index** button
   - This launches the search index configuration wizard

2. **Choose Configuration Method**:
   - Select **JSON Editor** option for advanced configuration
   - Click **Next** to proceed to index configuration

3. **Configure Index Details**:
   
   | Setting | Value | Description |
   |---------|-------|-------------|
   | **Index Name** | `search-videos` | Must match controller configuration |
   | **Database** | `viztube` | Your VizTube database name |
   | **Collection** | `videos` | Video collection to index |

   > ⚠️ **Important**: The index name `search-videos` must match exactly with the name specified in `video.controller.js`

### Step 3: Define Search Index Mapping

1. **Clear Default Content**:
   - In the JSON editor, **delete all existing default content**

2. **Paste Index Configuration**:
   ```json
   {
     "mappings": {
       "dynamic": false,
       "fields": {
         "description": [
           {
             "type": "string"
           }
         ],
         "title": [
           {
             "type": "string"
           }
         ]
       }
     }
   }
   ```

3. **Configuration Explanation**:
   - **`dynamic: false`**: Only indexes specified fields (better performance)
   - **`title` field**: Enables search on video titles
   - **`description` field**: Enables search on video descriptions
   - **`type: "string"`**: Full-text search capability for text content

### Step 4: Deploy the Index

1. **Review Configuration**:
   - Click **Next** to proceed to the review screen
   - Verify all settings are correct:
     - Index name: `search-videos`
     - Database: `viztube`
     - Collection: `videos`
     - JSON configuration matches the provided schema

2. **Create Index**:
   - Click **Create Search Index** to deploy
   - Atlas will begin building the search index

### Step 5: Monitor Index Status

1. **Track Build Progress**:
   - Return to the **Search** tab in your cluster dashboard
   - Monitor the "Status" indicator for your `search-videos` index

2. **Status Indicators**:
   - 🟡 **Building**: Index creation in progress (1-2 minutes)
   - 🟢 **Active**: Index ready for use
   - 🔴 **Failed**: Index creation error (check configuration)

3. **Completion Verification**:
   - Wait for status to show **"Active"** with green indicator
   - Index build time depends on collection size (typically 1-2 minutes for new collections)

## ✅ Testing the Search Functionality

Once your index is active, test the search feature:

### Basic Search Test
```bash
# Search for videos containing "tutorial"
GET /api/v1/videos?query=tutorial

# Search with pagination
GET /api/v1/videos?query=javascript&page=1&limit=10

# Search with sorting
GET /api/v1/videos?query=react&sortBy=createdAt&sortType=desc
```

### Postman Testing
1. **Open** the VizTube Postman collection
2. **Navigate** to `videos` folder → `GET all videos`
3. **Add query parameter**: `query` with value `test search term`
4. **Send request** and verify search results

## 🔧 Advanced Configuration

### Custom Search Options

For more advanced search capabilities, you can enhance the index configuration:

```json
{
  "mappings": {
    "dynamic": false,
    "fields": {
      "title": {
        "type": "string",
        "analyzer": "lucene.standard"
      },
      "description": {
        "type": "string",
        "analyzer": "lucene.standard"
      },
      "tags": {
        "type": "string"
      },
      "owner": {
        "type": "objectId"
      }
    }
  }
}
```

### Search Features
- **Fuzzy Search**: Handles typos and variations
- **Phrase Matching**: Exact phrase searches with quotes
- **Boolean Operators**: AND, OR, NOT operations
- **Field Weighting**: Prioritize title matches over description

## 🚨 Troubleshooting

### Common Issues

**Index Build Failed**
- **Cause**: Invalid JSON configuration
- **Solution**: Verify JSON syntax and field mappings

**Search Returns No Results**
- **Cause**: Index not active or wrong index name
- **Solution**: Check index status and verify name matches controller

**Poor Search Performance**
- **Cause**: Large collection without proper indexing
- **Solution**: Optimize index mappings for specific fields

**Authentication Errors**
- **Cause**: Insufficient Atlas permissions
- **Solution**: Ensure user has `atlasAdmin` or `readWriteAnyDatabase` roles

### Index Management

**Updating the Index**:
1. Click on your existing `search-videos` index
2. Select **Edit Index**
3. Modify JSON configuration
4. **Save** changes (triggers rebuild)

**Deleting the Index**:
1. Click the **trash icon** next to your index
2. **Confirm deletion**
3. Recreate if needed following this guide

## 📊 Performance Optimization

### Best Practices
- **Selective Indexing**: Only index searchable fields
- **Analyzer Selection**: Choose appropriate text analyzers
- **Regular Maintenance**: Monitor index performance and usage

### Monitoring
- **Search Metrics**: Track query performance in Atlas
- **Index Size**: Monitor storage usage
- **Query Patterns**: Analyze common search terms

## 🔄 Integration with VizTube API

### Search Endpoint Usage
```javascript
// In your frontend application
const searchVideos = async (query, page = 1, limit = 10) => {
  const response = await fetch(
    `/api/v1/videos?query=${encodeURIComponent(query)}&page=${page}&limit=${limit}`
  );
  return response.json();
};
```

### Backend Implementation
The search functionality is already implemented in `video.controller.js` and will automatically use your Atlas Search index once it's active.

## 📞 Support & Resources

- **MongoDB Atlas Documentation**: [Atlas Search Guide](https://docs.atlas.mongodb.com/atlas-search/)
- **VizTube API Documentation**: Refer to main README.md
- **Index Management**: Atlas dashboard → Search tab
- **Performance Monitoring**: Atlas dashboard → Metrics

---

**🎉 Congratulations!** Your VizTube platform now has powerful search capabilities. Users can find videos using natural language queries across titles and descriptions.