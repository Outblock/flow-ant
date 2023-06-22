import * as fcl from '@onflow/fcl'
import { execScript } from '../utils'
import { getSupportTokenVaultPath } from '../config/constants'
const check_domain_collection = fcl.cdc`
import Domains from 0xDomains

pub fun main(address: Address) : Bool {
    return getAccount(address).getCapability<&{Domains.CollectionPublic}>(Domains.CollectionPublicPath).check()
}`

const query_root_domains_by_id = fcl.cdc`
import Flowns from 0xFlowns

pub fun main(id: UInt64): Flowns.RootDomainInfo? {
    return Flowns.getRootDomainInfo(domainId: id)
}`

const query_root_domains = fcl.cdc`
import Flowns from 0xFlowns

pub fun main() : { UInt64: Flowns.RootDomainInfo }? {
  return Flowns.getAllRootDomains()
}`

const query_domain_rent_prices = fcl.cdc`
import Flowns from 0xFlowns

pub fun main(domainId: UInt64) : { Int: UFix64 }? {
    return Flowns.getRentPrices(domainId: domainId)
}`

const query_domain_available = fcl.cdc`
import Flowns from 0xFlowns

pub fun main(nameHash: String) : Bool {
  return Flowns.available(nameHash: nameHash)
}`

const query_flow_balance = fcl.cdc`
import FungibleToken from 0xFungibleToken

pub fun main(address: Address) : UFix64 {
    let account = getAccount(address)
    var balance = 0.00
    if let vault = account.getCapability(/public/flowTokenBalance).borrow<&{FungibleToken.Balance}>() {
      balance = vault.balance
    }
    return balance
}`

const query_domain_record = fcl.cdc`
import Domains from 0xDomains
import Flowns from 0xFlowns

pub fun main(label: String, root: String): Address? {
  let prefix = "0x"
  let rootHahsh = Flowns.hash(node: "", lable: root)
  let nameHash = prefix.concat(Flowns.hash(node: rootHahsh, lable: label))
  var address = Domains.getRecords(nameHash)
  return address
}`

const query_domain_is_expired = fcl.cdc`
import Domains from 0xDomains

pub fun main(nameHash: String): Bool {
  return Domains.isExpired(nameHash)
}`

const query_domain_info = fcl.cdc`
import Domains from 0xDomains

pub fun main(nameHash: String): Domains.DomainDetail? {
  let address = Domains.getRecords(nameHash) ?? panic("Domain not exist")
  let account = getAccount(address)
  let collectionCap = account.getCapability<&{Domains.CollectionPublic}>(Domains.CollectionPublicPath) 
  let collection = collectionCap.borrow()!
  var detail: Domains.DomainDetail? = nil

  let id = Domains.getDomainId(nameHash)
  if id != nil && !Domains.isDeprecated(nameHash: nameHash, domainId: id!) {
    let domain = collection.borrowDomain(id: id!)
    detail = domain.getDetail()
  }

  return detail
}`

const query_domain_page_info = fcl.cdc`
import Domains from 0xDomains

pub fun main(nameHash: String): {String: AnyStruct}? {
  let map: {String: AnyStruct} = {}

  let address = Domains.getRecords(nameHash) ?? panic("Domain not exist")
  let id = Domains.getDomainId(nameHash)
  let expiredAt = Domains.getExpiredTime(nameHash)

  map["id"] = id
  map["owner"] = address
  map["expiredAt"] = expiredAt

  return map
}`

const query_domain_info_with_raw = fcl.cdc`
import Domains from 0xDomains
import Flowns from 0xFlowns

pub fun main(label: String, root: String): Domains.DomainDetail? {
  let prefix = "0x"
  let rootHahsh = Flowns.hash(node: "", lable: root)
  let nameHash = prefix.concat(Flowns.hash(node: rootHahsh, lable: label))
  let address = Domains.getRecords(nameHash) ?? panic("Domain not exist")
  let account = getAccount(address)
  let collectionCap = account.getCapability<&{Domains.CollectionPublic}>(Domains.CollectionPublicPath) 
  let collection = collectionCap.borrow()!
  var detail: Domains.DomainDetail? = nil

  let id = Domains.getDomainId(nameHash)
  if id != nil && !Domains.isDeprecated(nameHash: nameHash, domainId: id!) {
    let domain = collection.borrowDomain(id: id!)
    detail = domain.getDetail()
  }

  return detail
}`
const query_domain_deprecated_info = fcl.cdc`
import Domains from 0xDomains
import Flowns from 0xFlowns

pub fun main(nameHash: String, id: UInt64): Domains.DomainDeprecatedInfo? {
  let deprecatedInfo = Domains.getDeprecatedRecords(nameHash) ?? panic("Domain not exist")
  let info = deprecatedInfo[id]
  return info
}`

const query_domain_available_with_raw = fcl.cdc`
import Domains from 0xDomains
import Flowns from 0xFlowns

pub fun main(label: String, root: String): Bool {
  let prefix = "0x"
  let rootHahsh = Flowns.hash(node: "", lable: root)
  let nameHash = prefix.concat(Flowns.hash(node: rootHahsh, lable: label))
  return Flowns.available(nameHash: nameHash)
}`

const query_user_domains_info = fcl.cdc`
import Domains from 0xDomains

pub fun main(address: Address): [Domains.DomainDetail] {
  let account = getAccount(address)
  let collectionCap = account.getCapability<&{Domains.CollectionPublic}>(Domains.CollectionPublicPath) 
  let collection = collectionCap.borrow()!
  let domains:[Domains.DomainDetail] = []
  let ids = collection.getIDs()
  
  for id in ids {
    let domain = collection.borrowDomain(id: id)
    let detail = domain.getDetail()
    domains.append(detail)
  }

  return domains
}`

const query_root_vault_balance = fcl.cdc`
import Flowns from 0xFlowns

pub fun main(id: UInt64): UFix64 {
  let balance = Flowns.getRootVaultBalance(domainId: id)
  return balance
}`

const query_domain_deprecated = fcl.cdc`
import Domains from 0xDomains

pub fun main(nameHash: String): {UInt64: Domains.DomainDeprecatedInfo}? {
  return Domains.getDeprecatedRecords(nameHash)
}`

const get_block_timestamp = fcl.cdc`
import Flowns from 0xFlowns

pub fun main(): UFix64 {
  return getCurrentBlock().timestamp
}`

const calc_hash = fcl.cdc`
import Flowns from 0xFlowns

pub fun main(lable: String, root: String) : String {
  let prefix = "0x"
  let rootHahsh = Flowns.hash(node: "", lable: root)
  let nameHash = prefix.concat(Flowns.hash(node: rootHahsh, lable: lable))
  return nameHash
}`

const get_flowns_root_num = fcl.cdc`
import Flowns from 0xFlowns

pub fun main() : Bool {
  return Flowns.totalRootDomains
}`

const get_flowns_domain_num = fcl.cdc`
import Domains from 0xDomains

pub fun main() : Bool {
  return Domains.totalSupply
}`

const get_domain_price = fcl.cdc`
import Flowns from 0xFlowns

pub fun main(domainId: UInt64, name: String) : UFix64? {
  let root = Flowns.getRootDomainInfo(domainId: domainId)!
  var length = name.length
  if length > 10 {
    length = 10
  }
  return root.prices[length]
}`

const get_domain_length = fcl.cdc`
pub fun main(name: String) : Int {
  return name.length
}`

const get_user_domain_ids = fcl.cdc`
import Domains from 0xDomains

pub fun main(address: Address): [UInt64] {
  let account = getAccount(address)
  let collectionCap = account.getCapability<&{Domains.CollectionPublic}>(Domains.CollectionPublicPath) 
  let collection = collectionCap.borrow()!
  let domains:[Domains.DomainDetail] = []
  let ids = collection.getIDs()
  return ids
}
`

const get_default_flowns_name = fcl.cdc`
import Flowns from 0xFlowns
import Domains from 0xDomains

 pub fun main(address: Address): String? {
      
    let account = getAccount(address)
    let collectionCap = account.getCapability<&{Domains.CollectionPublic}>(Domains.CollectionPublicPath) 
  
    if collectionCap.check() != true {
      return nil
    }
  
    var flownsName = ""
    let collection = collectionCap.borrow()!
    let ids = collection.getIDs()
    flownsName = collection.borrowDomain(id: ids[0])!.getDomainName()
    for id in ids {
      let domain = collection.borrowDomain(id: id)!
      let isDefault = domain.getText(key: "isDefault")
      if isDefault == "true" {
        flownsName = domain.getDomainName()
        break
      }
    }
  
    return flownsName
  }`

const query_ft_balance = (opt) => {
  const { tokenConfig } = opt
  const { type, publicBalPath } = tokenConfig
  const typeArr = type.split('.')
  const contractAddr = typeArr[1]
  const contractName = typeArr[2]

  return fcl.cdc`
  import FungibleToken from 0xFungibleToken
  import ${contractName} from 0x${contractAddr}
  
  pub fun main(address: Address): UFix64? {
    let account = getAccount(address)
    var balance :UFix64? = nil
    if let vault = account.getCapability(${publicBalPath}).borrow<&{FungibleToken.Balance}>() {
      balance = vault.balance
    }
    return balance
  }`
}

const query_stroage_paths = ({ outdatedPaths }) => {
  return fcl.cdc`
  pub fun main(address: Address): [StoragePath] {

    ${outdatedPaths}
  
    let account = getAuthAccount(address)
    let cleandPaths: [StoragePath] = []
    for path in account.storagePaths {
      if (outdatedPaths.containsKey(path)) {
        continue
      }
  
      cleandPaths.append(path)
    }
    return cleandPaths
  }
  `
}

const query_stored_items = () => {
  return fcl.cdc`
  import FungibleToken from 0xFungibleToken
  import NonFungibleToken from 0xNonFungibleToken
  import MetadataViews from 0xMetadataViews

  pub struct CollectionDisplay {
    pub let name: String
    pub let squareImage: MetadataViews.Media

    init(name: String, squareImage: MetadataViews.Media) {
      self.name = name
      self.squareImage = squareImage
    }
  }

  pub struct Item {
    pub let address: Address
    pub let path: String
    pub let type: Type
    pub let isResource: Bool
    pub let isNFTCollection: Bool
    pub let display: CollectionDisplay?
    pub let tokenIDs: [UInt64]
    pub let isVault: Bool
    pub let balance: UFix64?

    init(address: Address, path: String, type: Type, isResource: Bool, 
      isNFTCollection: Bool, display: CollectionDisplay?,
      tokenIDs: [UInt64], isVault: Bool, balance: UFix64?) {
        self.address = address
        self.path = path
        self.type = type
        self.isResource = isResource
        self.isNFTCollection = isNFTCollection
        self.display = display
        self.tokenIDs = tokenIDs
        self.isVault = isVault
        self.balance = balance
    }
  }

  pub fun main(address: Address, pathIdentifiers: [String]): [Item] {
    let account = getAuthAccount(address)
    let resourceType = Type<@AnyResource>()
    let vaultType = Type<@FungibleToken.Vault>()
    let collectionType = Type<@NonFungibleToken.Collection>()
    let metadataViewType = Type<@AnyResource{MetadataViews.ResolverCollection}>()
    let items: [Item] = []

    for identifier in pathIdentifiers {
      let path = StoragePath(identifier: identifier)!

      if let type = account.type(at: path) {
        let isResource = type.isSubtype(of: resourceType)
        let isNFTCollection = type.isSubtype(of: collectionType)
        let conformedMetadataViews = type.isSubtype(of: metadataViewType)

        var tokenIDs: [UInt64] = []
        var collectionDisplay: CollectionDisplay? = nil
        if isNFTCollection && conformedMetadataViews {
          if let collectionRef = account.borrow<&{MetadataViews.ResolverCollection, NonFungibleToken.CollectionPublic}>(from: path) {
            tokenIDs = collectionRef.getIDs()

            // TODO: move to a list
            if tokenIDs.length > 0 
            && path != /storage/RaribleNFTCollection 
            && path != /storage/ARTIFACTPackV3Collection
            && path != /storage/ArleeScene {
              let resolver = collectionRef.borrowViewResolver(id: tokenIDs[0]) 
              if let display = MetadataViews.getNFTCollectionDisplay(resolver) {
                collectionDisplay = CollectionDisplay(
                  name: display.name,
                  squareImage: display.squareImage
                )
              }
            }
          }
        } else if isNFTCollection {
          if let collectionRef = account.borrow<&NonFungibleToken.Collection>(from: path) {
            tokenIDs = collectionRef.getIDs()
          }
        }

        let isVault = type.isSubtype(of: vaultType) 
        var balance: UFix64? = nil
        if isVault {
          if let vaultRef = account.borrow<&FungibleToken.Vault>(from: path) {
            balance = vaultRef.balance
          }
        }

        let item = Item(
          address: address,
          path: path.toString(),
          type: type,
          isResource: isResource,
          isNFTCollection: isNFTCollection,
          display: collectionDisplay,
          tokenIDs: tokenIDs,
          isVault: isVault,
          balance: balance
        )

        items.append(item)
      }
    }

    return items
  }
  
  `
}

const query_private_items = fcl.cdc`
pub struct Item {
  pub let address: Address
  pub let path: String
  pub let type: Type
  pub let targetPath: String?

  init(
    address: Address, 
    path: String, 
    type: Type, 
    targetPath: String?
  ) {
    self.address = address
    self.path = path
    self.type = type
    self.targetPath = targetPath
  }
}

pub fun main(address: Address, pathMap: {String: Bool}): [Item] {
  let account = getAuthAccount(address)

  let items: [Item] = []
  account.forEachPrivate(fun (path: PrivatePath, type: Type): Bool {
    if !pathMap.containsKey(path.toString()) {
      return true
    }

    var targetPath: String? = nil
    if let target = account.getLinkTarget(path) {
      targetPath = target.toString()
    }

    let item = Item(
      address: address,
      path: path.toString(),
      type: type,
      targetPath: targetPath
    )

    items.append(item)
    return true
  })

  return items
}
  `

const query_private_paths = ({ outdatedPaths }) => {
  return fcl.cdc`
    pub fun main(address: Address): [PrivatePath] {
      ${outdatedPaths}
      
      let account = getAuthAccount(address)
      let cleandPaths: [PrivatePath] = []
      for path in account.privatePaths {
        if (outdatedPaths.containsKey(path)) {
          continue
        }
    
        cleandPaths.append(path)
      }
      return cleandPaths
    }
  `
}

const query_catalog_type_data = fcl.cdc`
import NFTCatalog from 0xNFTCatalog

pub fun main(): {String : {String : Bool}} {
  let catalog = NFTCatalog.getCatalogTypeData()
  return catalog
}
  `
const query_nft_catalog_by_collection_ids = fcl.cdc`
import NFTCatalog from 0xNFTCatalog

pub fun main(collectionIdentifiers: [String]): {String: NFTCatalog.NFTCatalogMetadata} {
  let res: {String: NFTCatalog.NFTCatalogMetadata} = {}
  for collectionID in collectionIdentifiers {
      if let catalog = NFTCatalog.getCatalogEntry(collectionIdentifier: collectionID) {
        res[collectionID] = catalog
      }
  }
  return res
}
  `

const query_stored_struct = fcl.cdc`
pub fun main(address: Address, pathStr: String): &AnyStruct? {
  let account = getAuthAccount(address)
  let path = StoragePath(identifier: pathStr)!
  return account.borrow<&AnyStruct>(from: path)
}
  `
const query_stored_resource = fcl.cdc`
pub fun main(address: Address, pathStr: String): &AnyResource? {
  let account = getAuthAccount(address)
  let path = StoragePath(identifier: pathStr)!
  return account.borrow<&AnyResource>(from: path)
}
  `

export const scripts = {
  check_domain_collection,
  query_root_domains_by_id,
  query_root_domains,
  query_domain_rent_prices,
  query_domain_available,
  query_flow_balance,
  query_ft_balance,
  query_domain_record,
  query_domain_is_expired,
  query_domain_info,
  query_user_domains_info,
  query_root_vault_balance,
  query_domain_deprecated,
  get_block_timestamp,
  calc_hash,
  get_flowns_root_num,
  get_flowns_domain_num,
  get_domain_price,
  get_domain_length,
  get_user_domain_ids,
  query_domain_info_with_raw,
  query_domain_available_with_raw,
  query_domain_page_info,
  query_domain_deprecated_info,
  get_default_flowns_name,
  query_stroage_paths,
  query_stored_items,
  query_private_paths,
  query_private_items,
  query_catalog_type_data,
  query_nft_catalog_by_collection_ids,
  query_stored_struct,
  query_stored_resource,
}

export const buildAndExecScript = async (key, args = [], opt = {}) => {
  let script = scripts[key]
  if (typeof script == 'function') {
    script = script(opt)
  }
  const result = await execScript(script, args)
  return result
}
