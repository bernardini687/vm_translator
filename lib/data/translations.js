module.exports = {
  pushConstant: (value) => `@${value}
D=A
@SP
AM=M+1
A=A-1
M=D`,
  add: () => `@SP
AM=M-1
D=M
A=A-1
M=D+M`
}
