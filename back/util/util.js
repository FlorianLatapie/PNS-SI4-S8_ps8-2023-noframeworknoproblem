export function displayACatchedError(error, customTitle = "") {
    console.log("--- Catched an error ---")
    console.log(customTitle + "\n")
    console.log(error)
    console.log("------------------------")
}