# ContentDownloader

JavaScript tool for downloading files from Google Drive and data from AirTable.

## Google Drive integration

### How to set up the project?

- Create a `Google Cloud Project`.
- Enable the Google Drive API.
- Create an Auth 2.0 credential.
- Download that JSON file.
- Locate that JSON file in the repository and rename it to `credentials.json`.

### How to run the script?

- Run `npm run gdrive`
- If you don't have a token, the script will ask you browse to a URL.
- Once you browse to that URL, you will be redirected to `google.com`.
- Copy that URL to which you were redirected and paste in the terminal.
- A token will be generated and stored and the script will run.

### Sample code for getting a list of files and folders

```javascript
const auth = await authorize()
const data = await getList(auth)
```

### Sample code for getting a list of folders

```javascript
const auth = await authorize()
const data = await getFolderList(auth)
```

### Sample code for getting a folder content

```javascript
const auth = await authorize()
const data = await getFolderContent(auth, folderID)
```

### Sample code for downloading a file

```javascript
const auth = await authorize()
downloadFile(auth, fileID, filename)
```

## AirTable integration

### Setting the credentials

- Create a `.env` file (there is a `.env.sample` file).
- Set the `AIRTABLE_TOKEN`, `AIRTABLE_BASE_ID` and `AIRTABLE_TABLE_NAME` variables.

### How to get the table data from AirTable?

- Run `npm run airtable`.
