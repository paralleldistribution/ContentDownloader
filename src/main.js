require("dotenv").config()
const fs = require("fs")
const path = require("path")

const { authorize, downloadFile, getFolderContent } = require("./gdrive")
const { getNextRecord, getSerialNumber } = require("./airtable")

const extractFileIdFromUrl = (url) => {
  const fileMatch = url.match(/\/d\/([a-zA-Z0-9-_]+)/)
  if (fileMatch) return fileMatch[1]

  const folderMatch = url.match(/\/folders\/([a-zA-Z0-9-_]+)/)
  return folderMatch ? folderMatch[1] : null
}

const saveInfoAsJson = (
  files,
  record,
  serialNumber,
  folderPath,
  clientName,
  outputFileName
) => {
  const taskObject = {
    files: files,
    caption: record.fields["Caption"],
    sound: record.fields["Sound"],
    account: record.fields["TikTok @handle"],
    device: serialNumber,
    client: clientName,
  }

  const filePath = path.join(folderPath, outputFileName) // "slideshow_" + record.id + ".json")
  fs.writeFile(filePath, JSON.stringify(taskObject, null, 2), (err) => {
    if (err) {
      console.error("Error saving files to JSON:", err)
      return
    }
    console.log("Files saved to JSON successfully.")
  })
}

const downloadLatestImagesAndSaveToJson = async (tiktokHandle, outputFileName) => {
  try {
    const auth = await authorize()
    const { serialNumber, clientName } = await getSerialNumber(tiktokHandle) //Gets from master airtable
    const records = await getNextRecord(clientName, tiktokHandle) //gets from client airtable

    var files = []
    for (const record of [records[0]]) {
      const driveUrl = record.fields["Slides Drive URL"]
      if (driveUrl) {
        const folderId = extractFileIdFromUrl(driveUrl)
        if (folderId) {
          const folderContents = await getFolderContent(auth, folderId)
          const recordFolder = "../AndroidAgent/"
          /*
          const recordFolder = path.join(__dirname, record.id)
          if (!fs.existsSync(recordFolder)) {
            fs.mkdirSync(recordFolder, { recursive: true })
          }
          */

          for (const file of folderContents) {
            const fileName = `${file.name}`
            const filePath = path.join(recordFolder, fileName)
            downloadFile(auth, file.id, filePath)
            files.push(fileName)
          }
          saveInfoAsJson(
            files,
            record,
            serialNumber,
            recordFolder,
            clientName,
            outputFileName
          )
        } else {
          console.log(`Invalid Drive URL for record ${record.id}`)
        }
      } else {
        console.log(`No Drive URL found for record ${record.id}`)
      }
    }
  } catch (error) {
    console.error("Error downloading images:", error)
  }
}

const main = (tiktokHandle, outputFileName) => {
  downloadLatestImagesAndSaveToJson(tiktokHandle, outputFileName)
}

const args = process.argv.slice(2)
const tiktokHandle = args[0]
const outputFileName = args[1]

main(tiktokHandle, outputFileName)
