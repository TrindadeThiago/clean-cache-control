import { mockPurchases, CacheStoreSpy } from '@/data/tests'
import { LocalSavePurchases } from "@/data/usecase"

type SutTypes = {
  sut: LocalSavePurchases
  cacheStore: CacheStoreSpy
}

const makeSut = (timestamp = new Date()): SutTypes => {
  const cacheStore = new CacheStoreSpy()
  const sut = new LocalSavePurchases(cacheStore, timestamp)

  return { sut, cacheStore }
}

describe('LocalSavePurchases', () => {
  test('Should not delete or insert cache on sut.init', () => {
    const { cacheStore } = makeSut()
    expect(cacheStore.actions).toEqual([])
  })

  test('Should not insert new cache if delete fails', async () => {
    const { cacheStore, sut } = makeSut()
    cacheStore.simulateDeleteError()
    const promise = sut.save(mockPurchases())
    expect(cacheStore.actions).toEqual([CacheStoreSpy.Action.delete])
    await expect(promise).rejects.toThrow()
  })

  test('Should insert new cache if delete succeeds', async () => {
    const timestamp = new Date()
    const { cacheStore, sut } = makeSut()
    const purchases = mockPurchases()
    const promise = sut.save(purchases)
    expect(cacheStore.actions).toEqual([CacheStoreSpy.Action.delete, CacheStoreSpy.Action.insert])
    expect(cacheStore.deleteKey).toBe('purchases')
    expect(cacheStore.insertKey).toBe('purchases')
    expect(cacheStore.insertValues).toEqual({
      timestamp,
      value: purchases
    })
    await expect(promise).resolves.toBeFalsy()
  })

  test('Should throw if insert thorows', async () => {
    const { cacheStore, sut } = makeSut()
    cacheStore.simulateInsertError()
    const promise = sut.save(mockPurchases())
    expect(cacheStore.actions).toEqual([CacheStoreSpy.Action.delete, CacheStoreSpy.Action.insert])
    await expect(promise).rejects.toThrow()
  })
})
