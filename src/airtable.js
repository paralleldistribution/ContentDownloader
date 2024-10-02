require("dotenv").config()

const token =
  process.env.AIRTABLE_TOKEN ||
  "patkhpCdUiP3Wnv0I.2b269a0280d0af2a2bd935fe8d42b1e9e6da57161d075d980345a749dd117356"

const downloadData = async (url = "") => {
  const requestOptions = {
    headers: {
      Authorization: "Bearer " + token,
    },
  }
  const response = await fetch(url, requestOptions)
  const data = await response.json()
  return data
}

const getBaseAndTable = (client) => {
  if (client == "mro") {
    return {
      baseId: "apprCx0TVcBxkX4Vm",
      tableName: "tblule8kefnyEGVB6",
    }
  } else if (client == "gruns") {
    return {
      baseId: "appyR6tuVD0RO2dls",
      tableName: "tblBANBVeGMS8L41c",
    }
  }
}

const getNextRecord = async (clientName, tiktokHandle) => {
  const { baseId, tableName } = getBaseAndTable(clientName)
  const formula = `AND({Slides Drive URL} != '', {TikTok @handle} = '${tiktokHandle}')` // Ensure we get valid records
  const url = `https://api.airtable.com/v0/${baseId}/${tableName}?maxRecords=1&filterByFormula=${encodeURIComponent(formula)}`
  const data = await downloadData(url)
  console.log("airtable url", url)
  console.log("airtable data", data)
  return data.records
}

module.exports = {
  getNextRecord,
}
