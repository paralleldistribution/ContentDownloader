require("dotenv").config()

const token =
  process.env.AIRTABLE_TOKEN ||
  "patxJ0kokbjKuFD66.4b6b48b78e7d451504d3f39fcd1bc624c6095e92ace353fcd5d3bb7aab844115"

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
  if (client == "MaryRuthOrganics") {
    return {
      baseId: "apprCx0TVcBxkX4Vm",
      tableName: "tblule8kefnyEGVB6",
    }
  } else if (client == "Gruns") {
    return {
      baseId: "appyR6tuVD0RO2dls",
      tableName: "tblBANBVeGMS8L41c",
    }
  } else if (client == "master") {
    return {
      baseId: "apptIcAWN1SuIKz54",
      tableName: "tblLi7UlsnVrvqut6",
    }
  }
}

const getNextRecord = async (clientName, tiktokHandle) => {
  const { baseId, tableName } = getBaseAndTable(clientName)
  const formula = `AND({Slides Drive URL} != '', {TikTok @handle} = '${tiktokHandle}')` // Ensure we get valid records
  const url = `https://api.airtable.com/v0/${baseId}/${tableName}?maxRecords=1&filterByFormula=${encodeURIComponent(formula)}`
  const data = await downloadData(url)
  return data.records
}

const getSerialNumber = async (handle) => {
  const { baseId, tableName } = getBaseAndTable("master")
  const formula = `{TikTok @handle} = '${handle}'` // Ensure we get valid records
  const url = `https://api.airtable.com/v0/${baseId}/${tableName}?maxRecords=1&filterByFormula=${encodeURIComponent(formula)}`
  const data = await downloadData(url)
  console.log(url)
  console.log(data)
  return data.records[0].fields["Serial Number"]
}

module.exports = {
  getNextRecord,
  getSerialNumber,
}
