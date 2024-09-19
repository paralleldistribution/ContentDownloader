# ContentDownloader

JavaScript tool for downloading files from Google Drive and data from AirTable.

## Google Drive Integration

### How to set up the project?

- Create a ```Google Cloud Project```.
- Enable the Google Drive API.
- Create an Auth 2.0 credential.
- Download that JSON file.
- Locate that JSON file in the repository and rename it to ```credentials.json```.
- Run ```node index```

## Sample code for getting a list of files and folders

```javascript
  const auth = await authorize()
  const data = await getList(auth)
```

## Sample code for getting a list of folders

```javascript
  const auth = await authorize()
  const data = await getFolderList(auth)
```

## Sample code for getting a folder content

```javascript
  const auth = await authorize()
  const data = await getFolderContent(auth, folderID)
```

## Sample code for downloading a file

```javascript
  const auth = await authorize()
  downloadFile(auth, fileID, filename)
```
