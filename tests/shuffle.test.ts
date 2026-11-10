import { describe, expect, it } from 'vitest';
import { shuffle } from '../src/shuffle';

describe('embaralhamento', () => {
  it('preserva entradas, não repete itens e permite percurso determinístico', () => {
    const input = ['a', 'b', 'c', 'd'];
    const result = shuffle(input, () => 0);
    expect(input).toEqual(['a', 'b', 'c', 'd']);
    expect(result).toEqual(['b', 'c', 'd', 'a']);
    expect(new Set(result).size).toBe(input.length);
  });

  it('aceita sequências vazias e unitárias sem sorteio', () => {
    const failIfDrawn = () => { throw new Error('Sorteio desnecessário'); };
    expect(shuffle([], failIfDrawn)).toEqual([]);
    expect(shuffle(['a'], failIfDrawn)).toEqual(['a']);
  });
});
