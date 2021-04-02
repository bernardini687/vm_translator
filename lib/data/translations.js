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
M=D+M`,
  sub: () => `@SP
AM=M-1
D=M
A=A-1
M=M-D`,
  neg: () => `@SP
A=M-1
M=-M`,
  eq: (labelCounter) => `@SP
AM=M-1
D=M
A=A-1
D=M-D
M=-1
@EQ_LABEL_${labelCounter}
D;JEQ
@SP
A=M-1
M=0
(EQ_LABEL_${labelCounter})`,
  gt: (labelCounter) => `@SP
AM=M-1
D=M
A=A-1
D=M-D
M=-1
@GT_LABEL_${labelCounter}
D;JGT
@SP
A=M-1
M=0
(GT_LABEL_${labelCounter})`,
  lt: (labelCounter) => `@SP
AM=M-1
D=M
A=A-1
D=D-M
M=-1
@LT_LABEL_${labelCounter}
D;JGT
@SP
A=M-1
M=0
(LT_LABEL_${labelCounter})`,
  and: () => `@SP
AM=M-1
D=M
A=A-1
M=D&M`,
  or: () => `@SP
AM=M-1
D=M
A=A-1
M=D|M`,
  not: () => `@SP
A=M-1
M=!M`
}
