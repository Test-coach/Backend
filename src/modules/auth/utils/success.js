class SuccessResponse {
  constructor(message, data = null, statusCode = 200) {
    this.message = message;
    this.data = data;
    this.statusCode = statusCode;
  }

  sendResponse(res) {
    const response = {
      status: 'success',
      message: this.message
    };

    if (this.data) {
      response.data = this.data;
    }

    return res.status(this.statusCode).json(response);
  }
}

module.exports = SuccessResponse; 