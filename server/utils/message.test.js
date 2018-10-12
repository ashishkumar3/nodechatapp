const expect = require("expect");
const { generateMessage } = require("./message");

describe("generateMessage", () => {
  it("should generate correct message object", () => {
    let from = "Ashish";
    let text = "Some message";
    let message = generateMessage(from, text);

    console.log(message);

    expect(typeof message.createdAt).toBe("number");
    expect(message).toMatchObject({ from, text });
  });
});
