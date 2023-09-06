const { getDatabase, ref, get, child } = require("firebase/database");

module.exports = {
    enquetes: async () => {
        const db = getDatabase();
  
        return await get(child(ref(db), `enquetes`)).then((snapshot) => {
          const obj = snapshot.val()
          return Object.keys(obj).map(key => ({
            title: key,
            ...obj[key]
          }))
        })
      },
      enquete: async (_, { title }) => {
        const db = getDatabase();
  
        return await get(child(ref(db), `enquetes/${title}`)).then((snapshot) => {
          const obj = snapshot.val()
  
          return {
            title,
            ...obj
          }
        })
      }
}