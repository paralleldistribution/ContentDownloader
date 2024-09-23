const { readFileSync, writeFileSync, createWriteStream } = require("fs")
const readline = require("readline")
const { google } = require("googleapis")

const loadFile = (file) => {
  try {
    return JSON.parse(readFileSync(file))
  } catch (err) {
    return null
  }
}

const generateToken = async (oAuth2Client) => {
  const authUrl = oAuth2Client.generateAuthUrl({
    access_type: "offline",
    scope: [
      "https://www.googleapis.com/auth/drive.readonly",
      "https://www.googleapis.com/auth/drive.metadata.readonly",
    ],
  })

  console.log("Authorize this app by visiting this url:\n")
  console.log(authUrl + "\n")

  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  })

  return new Promise((resolve, reject) => {
    rl.question("Copy and paste the redirect URL here: ", (url_string) => {
      rl.close()

      const url = new URL(url_string)
      const code = url.searchParams.get("code")

      oAuth2Client.getToken(code, (err, token) => {
        if (err) {
          return reject("Error retrieving access token", err)
        }

        oAuth2Client.setCredentials(token)
        writeFileSync("token.json", JSON.stringify(token))
        resolve(oAuth2Client)
      })
    })
  })
}

const authorize = async () => {
  const credentials = loadFile("credentials.json")
  const { client_secret, client_id } = credentials.web
  const oAuth2Client = new google.auth.OAuth2(
    client_id,
    client_secret,
    "https://www.google.com"
  )

  try {
    const token = loadFile("token.json")
    if (!token) {
      return generateToken(oAuth2Client)
    }
    oAuth2Client.setCredentials(token)

    return oAuth2Client
  } catch (err) {
    return generateToken(oAuth2Client)
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

const test1 = async () => {
  console.log("getting a list of files and folders")
  const auth = await authorize()
  await getList(auth)
}

const test2 = async () => {
  console.log("getting a list of folders")
  const auth = await authorize()
  await getFolderList(auth)
}

const test3 = async (folderID) => {
  console.log("getting the folder content")
  const auth = await authorize()
  await getFolderContent(auth, folderID)
}

const test4 = async (fileID, filename) => {
  console.log("downloading a file")
  const auth = await authorize()
  downloadFile(auth, fileID, filename)
}

const test5 = async (folderID) => {
  console.log("downloading all files from a folder")
  const auth = await authorize()
  const data = await getFolderContent(auth, folderID)
  for (let i = 0; i < data.length; i++) {
    await test4(data[i].id, data[i].name)
  }
}

const runner = async () => {
  await test1()
  await test2()
  await test3("1QIJrxYm-uiPF7EPwUmgDApAkra0VGTtg")
  await test4("1K27sPdXuiT7FeLkPefbITxOgTZGUwiwD", "samsung.pdf")
  await test5("1QIJrxYm-uiPF7EPwUmgDApAkra0VGTtg")
}

runner()
