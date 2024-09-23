require("dotenv").config()

const token = process.env.AIRTABLE_TOKEN || ""
const baseId = process.env.AIRTABLE_BASE_ID || ""
const tableName = process.env.AIRTABLE_TABLE_NAME || ""

const downloadData = async (formula = "") => {
  const requestOptions = {
    headers: {
      Authorization: "Bearer " + token,
    },
  }

  const response = await fetch(
    "https://api.airtable.com/v0/" +
      baseId +
      "/" +
      tableName +
      "?filterByFormula=" +
      formula,
    requestOptions
  )
  const data = await response.text()
  console.log(data)
}

downloadData()
