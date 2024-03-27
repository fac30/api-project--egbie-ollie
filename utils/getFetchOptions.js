function getOptions(authorizationKey, accept="application/json") {
    return {
      method: 'GET',
      headers: {
        accept: accept,
        Authorization: `Bearer ${authorizationKey}`
      }
    };
  }
  

  async function getFetchJson(url, message) {
    const response = await fetch(url, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(message)
    });
    return response;
}



export {
  getOptions,
  getFetchJson,
 
}