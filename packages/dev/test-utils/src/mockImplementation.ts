/*
 * Copyright 2020 Adobe. All rights reserved.
 * This file is licensed to you under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License. You may obtain a copy
 * of the License at http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under
 * the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
 * OF ANY KIND, either express or implied. See the License for the specific language
 * governing permissions and limitations under the License.
 */

type Method = [any, string];
type Access = [any, string, 'get' | 'set'];
type SpyTarget = Method | Access
type MockCalls = Array<() => any>

// Util for mockImplementation that automatically handles extra calls needed for strict mode
export function mockImplementation(spyTarget: SpyTarget, mockCalls: MockCalls, retainLastMock = true): jest.SpyInstance<any, []> {
  if (mockCalls.length === 0) {
    throw new Error('MockCalls must have at least one mock implementation provided');
  }

  // multiple override definition of spyOn doesn't work with our type
  let spy = jest.spyOn(...(spyTarget as [any, string, 'get']));
  mockCalls.forEach(mock => {
    spy.mockImplementationOnce(mock);
  });

  if (process.env.STRICT_MODE) {
    mockCalls.forEach(mock => {
      spy.mockImplementationOnce(mock);
    });
  }

  if (retainLastMock) {
    spy.mockImplementation(mockCalls.at(-1));
  }

  return spy;
}

// Same as above but accepts an pre-existing spy instead of creating a new one
export function mockImplementationAdditional(spy: jest.SpyInstance<any, []>, mockCalls: MockCalls, retainLastMock = true): jest.SpyInstance<any, []> {
  if (mockCalls.length === 0) {
    throw new Error('MockCalls must have at least one mock implementation provided');
  }

  mockCalls.forEach(mock => {
    spy.mockImplementationOnce(mock);
  });

  if (process.env.STRICT_MODE) {
    mockCalls.forEach(mock => {
      spy.mockImplementationOnce(mock);
    });
  }

  if (retainLastMock) {
    spy.mockImplementation(mockCalls.at(-1));
  }

  return spy;
}
