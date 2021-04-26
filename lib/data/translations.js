module.exports = {
  pushConstant: (value) => (
`@${value}
D=A
@SP
AM=M+1
A=A-1
M=D`),
  pushBaseSegment: (value, segmentLabel) => ( // local, argument, this, that
`@${value}
D=A
@${segmentLabel}
A=M
A=D+A
D=M
@SP
AM=M+1
A=A-1
M=D`),
  pushTemp: (value) => (
`@${value}
D=A
@5
A=D+A
D=M
@SP
AM=M+1
A=A-1
M=D`),
  pushPointerOrStatic: (segmentLabel) => (
`@${segmentLabel}
D=M
@SP
AM=M+1
A=A-1
M=D`),
  popBaseSegment: (value, segmentLabel) => (
`@${segmentLabel}
D=M
@${value}
D=D+A
@R13
M=D
@SP
AM=M-1
D=M
@R13
A=M
M=D`),
  popTemp: (value) => (
`@5
D=A
@${value}
D=D+A
@R13
M=D
@SP
AM=M-1
D=M
@R13
A=M
M=D`),
  popPointerOrStatic: (segmentLabel) => (
`@SP
AM=M-1
D=M
@${segmentLabel}
M=D`),
  add: () => (
`@SP
AM=M-1
D=M
A=A-1
M=D+M`),
  sub: () => (
`@SP
AM=M-1
D=M
A=A-1
M=M-D`),
  neg: () => (
`@SP
A=M-1
M=-M`),
  eq: (labelCounter) => (
`@SP
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
(EQ_LABEL_${labelCounter})`),
  gt: (labelCounter) => (
`@SP
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
(GT_LABEL_${labelCounter})`),
  lt: (labelCounter) => (
`@SP
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
(LT_LABEL_${labelCounter})`),
  and: () => (
`@SP
AM=M-1
D=M
A=A-1
M=D&M`),
  or: () => (
`@SP
AM=M-1
D=M
A=A-1
M=D|M`),
  not: () => (
`@SP
A=M-1
M=!M`),
  label: (label) => (
`(${label})`),
  goto: (label) => (
`@${label}
0;JMP`),
  if: (label) => (
`@SP
AM=M-1
D=M
@${label}
D;JNE`),
  return: () => (
`@LCL
D=M
@R13
M=D
@5
D=D-A
A=D
D=M
@R14
M=D
@SP
A=M-1
D=M
@ARG
A=M
M=D
@ARG
D=M+1
@SP
M=D
@R13
AM=M-1
D=M
@THAT
M=D
@R13
AM=M-1
D=M
@THIS
M=D
@R13
AM=M-1
D=M
@ARG
M=D
@R13
AM=M-1
D=M
@LCL
M=D
@R14
A=M
0;JMP`)
}
