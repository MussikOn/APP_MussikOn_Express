import { randomInt } from "crypto"

export const numberRandon = () =>{
    const number = randomInt(100000,1000000);
    return number;
}
