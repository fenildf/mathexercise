
// RPN(Reverse Polish Notation)
export const RPNOperators: string[] = [
  '+',
  '-',
  '*',
  '/',
  '(',
  ')'
];

/**
 * Get the priority of the operators
 * @param operator The inputted operator
 */
export function RPNOperationPriority(operator: string): number {
  let opResult = 0;
  switch (operator) {
    case '+': opResult = 1; break;
    case '-': opResult = 1; break;
    case '*': opResult = 2; break;
    case '/': opResult = 2; break;
    case '(': opResult = 0; break;
    case ')': opResult = 0; break;
    default:
      throw new Error('Unsupported operator!');
  }
  return opResult;
}

/**
 * Workout the result based on the operator
 * @param x Previous element
 * @param y Next element
 * @param operator The operator
 */
export function RPNGetOperatorResult(x: number, y: number, operator: any): number {
  let rst = 0;
  switch (operator) {
    case '+': rst = x + y; break;
    case '-': rst = x - y; break;
    case '*': rst = x * y; break;
    case '/':
      try {
        rst = x / y;
      } catch (ex) {
        throw ex;
      }
      break;

    default:
      throw new Error('Operation has no result');
  }

  return rst;
}

/**
 * Workout the result for string with RPN format
 * @param strinputs String with RPN format, like '34+', it returns 7
 * Note:
 * 1) it only accept the inputs with PRN format; and
 * 2) it doesn't support '(' and ')', and
 * 3) it won't care of priority, for instance: '34+5*' will get 35 not 23 (3+4*5=23)
 */
export function rpn1(strinputs: string) {
  if (strinputs.length === 0) {
    return 0;
  }

  // Split into array of tokens
  const arinputs: any[] = strinputs.split(/\s+/);
  const stack = [];

  for (let i = 0; i < arinputs.length; i++) {
    const token = arinputs[i];

    // Token is a value, push it onto the stack
    if (!Number.isNaN(+token)) {
      stack.push(parseFloat(token));
    } else {
      // Every operation requires two arguments
      if (stack.length < 2) {
        throw new Error('Insufficient values in expression.');
      }

      // Pop two items from the top of the stack and push the result of the
      // operation onto the stack.
      const y = stack.pop();
      const x = stack.pop();
      /* eslint no-eval: 0 */
      stack.push(eval(x + token + ' ' + y));
    }
  }

  if (stack.length > 1) {
    throw new Error('Inputted expression has too many values.');
  }

  return stack.pop();
}

/**
 * Class for RPN
 */
export class RPN {
  private _arInputs: any[] = [];
  get InputArray(): any[] {
    return this._arInputs;
  }

  constructor() {
  }

  /**
   * Save to string
   */
  public toString(): string {
    return this._arInputs.join(' ');
  }

  /**
   * Build the express to PRN format
   * @param exp Express string, like 3*(4+5)
   */
  public buildExpress(exp: string) {

    const skOp = new Array();
    const operations = '+-*/';
    let digit = '';

    for (let i = 0; i < exp.length; i++) {
      const token = exp.charAt(i);
      if (!Number.isNaN(+token)) {
        // Digitials
        digit += token;
      } else if (operations.indexOf(token) >= 0) {
        if (digit.length > 0) {
          this._arInputs.push(digit);
          digit = '';
        }

        while (skOp.length > 0) {
          const opInStack = skOp.pop();
          if (opInStack === '(' || RPNOperationPriority(opInStack) < RPNOperationPriority(token)) {
            skOp.push(opInStack);
            break;
          } else {
            this._arInputs.push(opInStack);
          }
        }
        skOp.push(token);
      } else if (token === '(') {
        skOp.push(token);
      } else if (token === ')') {
        if (digit.length > 0) {
          this._arInputs.push(digit);
          digit = '';
        }

        while (skOp.length > 0) {
          const opInStack = skOp.pop();
          if (opInStack === '(') {
            break;
          } else {
            this._arInputs.push(opInStack);
          }
        }
      }
    }
    if (digit.length > 0) {
      this._arInputs.push(digit);
    }
    while (skOp.length > 0) {
      const opInStack = skOp.pop();
      this._arInputs.push(opInStack);
    }
    return this._arInputs.toString();
  }

  /**
   * Workout the final result
   */
  public WorkoutResult(): number {
    const stack = new Array();
    let result = 0;

    for (let i = 0; i < this._arInputs.length; i++) {
      const c = this._arInputs[i];
      if (!Number.isNaN(+c)) {
        stack.push(c);
      } else if (c === '+' || c === '-' || c === '*' || c === '/') {
        const nextNum = parseFloat(stack.pop());
        const prevNum = parseFloat(stack.pop());
        result = RPNGetOperatorResult(prevNum, nextNum, c);
        stack.push(result);
      }
    }
    return result;
  }

  // integer
  // fraction
  // decimal fraction
  public VerifyResult(allowNegative: boolean, allowDecimal: boolean): boolean {
    const stack = new Array();
    let result = 0;

    for (let i = 0; i < this._arInputs.length; i++) {
      const c = this._arInputs[i];

      if (!Number.isNaN(+c)) {
        stack.push(c);
      } else if (c === '+' || c === '-' || c === '*' || c === '/') {
        const nextNum = parseFloat(stack.pop());
        if (!Number.isInteger(nextNum) && !allowDecimal) {
          return false;
        }
        if (nextNum < 0 && !allowNegative) {
          return false;
        }

        const prevNum = parseFloat(stack.pop());
        if (!Number.isInteger(prevNum) && !allowDecimal) {
          return false;
        }
        if (prevNum < 0 && !allowNegative) {
          return false;
        }

        result = RPNGetOperatorResult(prevNum, nextNum, c);
        if (!Number.isInteger(result) && !allowDecimal) {
          return false;
        }
        if (result < 0 && !allowNegative) {
          return false;
        }

        stack.push(result);
      }
    }

    return true;
  }
}

