const { createWriteStream } = require("fs")
const { google } = require("googleapis")
const { JWT } = require("google-auth-library")

const authorize = async () => {
  const credentials = require("../service-account.json")
  const client = new JWT({
    email: credentials.client_email,
    key: credentials.private_key,
    scopes: ["https://www.googleapis.com/auth/drive"],
  })
  try {
    await client.authorize()
    console.log("Authentication successful")
    return client
  } catch (error) {
    console.error("Authentication failed:", error.message)
    throw error
  }
}

const getList = async (auth) => driveQuery(auth)

const getFolderList = async (auth) =>
  driveQuery(auth, "mimeType = 'application/vnd.google-apps.folder'")

const getFolderContent = async (auth, folderID) =>
  driveQuery(auth, "'" + folderID + "' in parents")

const driveQuery = async (auth, query) =>
  new Promise((resolve, reject) => {
    const result = []
    const drive = google.drive({ version: "v3", auth })

    drive.files.list(
      {
        pageSize: 1000,
        fields: "nextPageToken, files(id, name, mimeType)",
        q: query,
        orderBy: "name",
      },
      (err, res) => {
        if (err) {
          reject("The API returned an error: " + err)
        }

        const files = res.data.files
        if (files.length) {
          files.map((file) => {
            const type =
              file.mimeType === "application/vnd.google-apps.folder"
                ? "Folder"
                : "File"
            console.log(type + ": " + file.name + ", ID: " + file.id)
            result.push({ name: file.name, id: file.id })
          })
        }

        resolve(result)
      }
    )
  })

const downloadFile = (auth, fileId, dest) => {
  const drive = google.drive({ version: "v3", auth })
  const destStream = createWriteStream(dest)

  drive.files.get(
    { fileId: fileId, alt: "media" },
    { responseType: "stream" },
    (err, res) => {
      if (err) {
        return console.error("The API returned an error: " + err)
      }

      res.data
        .on("end", () => {
          console.log("Downloaded file to", dest)
        })
        .on("error", (err) => {
          console.error("Error downloading file:", err)
        })
        .pipe(destStream)
    }
  )
}

module.exports = {
  authorize,
  getList,
  getFolderList,
  getFolderContent,
  driveQuery,
  downloadFile,
}
