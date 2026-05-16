using System;
using System.Threading.Tasks;
using Microsoft.WindowsAzure.Storage;
using Microsoft.WindowsAzure.Storage.Auth;
using Microsoft.WindowsAzure.Storage.Blob;

namespace SmartHotel220.Web.Services
{
    /// <summary>
    /// Загрузчик фото/картинок в BLOB хранилище Azure
    /// </summary>
    public class PhotoUploader
    {
        /// <summary>
        /// Полномочия хранилища
        /// </summary>
        private readonly StorageCredentials _credentials;
        /// <summary>
        /// Аккаут хранилища
        /// </summary>
        private readonly CloudStorageAccount _storageAccount;
        /// <summary>
        /// Клиент BLOB-объектов
        /// </summary>
        private readonly CloudBlobClient _blobClient;

        public PhotoUploader(string name, string constr)
        {
            _credentials = new StorageCredentials(name, constr);
            _storageAccount = new CloudStorageAccount(_credentials, true);
            _blobClient = _storageAccount.CreateCloudBlobClient();
        }

        /// <summary>
        /// Загрузка фото питомца
        /// </summary>
        /// <param name="content">Контент в байтах т.к. это BLOB</param>
        public async Task<CloudBlockBlob> UploadPetPhotoAsync(byte[] content)
        {
            var petsContainer = _blobClient.GetContainerReference("pets");
            await petsContainer.CreateIfNotExistsAsync();

            var newBlob = petsContainer.GetBlockBlobReference(Guid.NewGuid().ToString());
            await newBlob.UploadFromByteArrayAsync(content, 0, content.Length);

            return newBlob;
        }
    }
}