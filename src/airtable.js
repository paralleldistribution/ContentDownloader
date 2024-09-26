require("dotenv").config()

const token = process.env.AIRTABLE_TOKEN || ""

const downloadData = async (url = "") => {
  const requestOptions = {
    headers: {
      Authorization: "Bearer " + token,
    },
  }
  const response = await fetch(url, requestOptions)
  const data = await response.json()
  console.log(data)
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

const getLatestRecords = async (clientName, limit = 10) => {
  const { baseId, tableName } = getBaseAndTable(clientName)
  const formula = `AND(RECORD_ID() != '', CREATED_TIME() != '', {Slides Drive URL} != '')` // Ensure we get valid records
  const url = `https://api.airtable.com/v0/${baseId}/${tableName}?maxRecords=${limit}&filterByFormula=${encodeURIComponent(formula)}`

  const data = await downloadData(url)

  return data.records
}

module.exports = {
  getLatestRecords,
}
