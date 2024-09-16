import { API_URL } from '../constants';

export default class ApiProxy {
  async getResults(board) {
    const data = await this.getData(`${API_URL}/compute`, board);

    return data;
  }

  async getData(url = '', data = {}) {
    const response = await fetch(`${url}?${new URLSearchParams({
      board: btoa(JSON.stringify(data)),
    }).toString()}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (response.ok) {
      return response.json();
    }

    return response.text().then((text) => { throw new Error(text); });
  }
}
