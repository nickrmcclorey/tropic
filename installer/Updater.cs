using System;
using System.Net;
using System.IO;
using System.Linq;
using System.Web;
using System.Collections.Generic;
using System.Security.Cryptography;
using Newtonsoft.Json;

namespace tropic_updater
{
    class Updater
    {
        private const string remoteUrl = "https://raw.githubusercontent.com/nickrmcclorey/tropic/gh-pages/";

        static void Main(string[] args)
        {

            ServicePointManager.Expect100Continue = true;
            ServicePointManager.SecurityProtocol = SecurityProtocolType.Tls12;
            Console.WriteLine("Calculating Hashes");
            Dictionary<string, string> latestHashes = JsonConvert.DeserializeObject<Dictionary<string, string>>(GetRequest("tropic-win32-x64-hashes.json"));
            List<string> filesToUpdate = filesToDownload(latestHashes);
            Console.WriteLine("Downloading " + filesToUpdate.Count + " file(s)");
            DownloadFiles(filesToUpdate);
            Console.WriteLine("Installing files");
            InstallFiles(filesToUpdate);
            if (Directory.Exists("./web_downloads"))
            {
                Directory.Delete("./web_downloads", true);
            }
            Console.WriteLine("downloaded and installed " + filesToUpdate.Count + " file(s)");
        }

        private static void InstallFiles(List<string> filesToUpdate)
        {
            foreach (string file in filesToUpdate)
            {
                Directory.CreateDirectory("./tropic-win32-x64/" + Path.GetDirectoryName(file));
                File.Copy("web_downloads/" + file, "./tropic-win32-x64/" + file, true);
            }
        }
        
        private static void DownloadFiles(List<string> files)
        {
            using (WebClient myWebClient = new WebClient())
            {
                foreach (string file in files)
                {
                    string myStringWebResource = remoteUrl + "tropic-win32-x64/" + file;
                    myStringWebResource = myStringWebResource.Replace("\\", "/").Replace("#", "%23");
                    try
                    {
                        string localPath = "web_downloads/" + file.Replace("\\", "/");
                        string fileName = Path.GetFileName(localPath);
                        Directory.CreateDirectory(localPath.Substring(0, localPath.LastIndexOf("/")));
                        myWebClient.DownloadFile(myStringWebResource, localPath);
                    }
                    catch (System.Net.WebException)
                    {
                        Console.WriteLine("failed to download " + myStringWebResource);
                        Environment.Exit(1);
                    }
                }
            }
        }

        private static void DownloadFile(string filePath, string localPath = null)
        {
            using (WebClient myWebClient = new WebClient())
            {
                string myStringWebResource = remoteUrl + filePath;
                localPath = localPath ?? "./web_downloads/" + filePath;
                string fileName = Path.GetFileName(localPath);
                // create a directory, but chop of the filename from the path passed in
                Directory.CreateDirectory(localPath.Replace(fileName, ""));
                myWebClient.DownloadFile(myStringWebResource, localPath);
            }
        }

        private static string GetRequest(string filePath)
        {
            using (WebClient webClient = new WebClient())
            {
                string webResource = remoteUrl + filePath;
                return webClient.DownloadString(webResource);
            }
        }

        private static List<string> filesToDownload(Dictionary<string, string> hashes)
        {
            List<string> modifiedFiles = new List<string>();
            foreach (KeyValuePair<string, string> file in hashes)
            {
                if (ComputeShaHash(file.Key) != file.Value)
                {
                    modifiedFiles.Add(file.Key);
                }
            }

            return modifiedFiles;
        }

        private static string ComputeShaHash(string path)
        {
            string filePath = Path.Combine("./tropic-win32-x64", path);
            if (!File.Exists(filePath))
            {
                return null;
            }

            using (var sha = SHA256.Create())
            {
                using (var stream = File.OpenRead(filePath))
                {
                    return Convert.ToBase64String(sha.ComputeHash(stream));
                }
            }
        }
    }
}
