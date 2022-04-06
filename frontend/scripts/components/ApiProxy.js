import { API_URL } from '../constants';

export default class ApiProxy {
  async getResults(board) {
    const data = await this.postData(API_URL, { board });

    return data;
  }

  async postData(url = '', data = {}) {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (response.ok) {
      return response.json();
    }

    return response.text().then((text) => { throw new Error(text); });
  }
}
